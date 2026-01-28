import type { CanvasPresenter } from "../../../canvas/presenter";
import type { ClipEffects } from "../../../canvas/state";
import { VideoElementPoolPresenter } from "../video-element-pool/presenter";
import type { CanvasCompositorState } from "./state";

/**
 * VideoCompositor - Hybrid multi-track video compositing
 * 
 * Two modes:
 * 1. PLAYBACK: Videos play natively for smooth motion. We just composite
 *    whatever frame each video currently has. Sync correction only for large drifts.
 * 2. SCRUBBING: Frame-accurate seeking - wait for all videos to seek before drawing.
 */
export class VideoCompositor {
    state: CanvasCompositorState;
    videoPool: VideoElementPoolPresenter;
    canvasPresenter: CanvasPresenter;

    constructor(
        state: CanvasCompositorState,
        videoPool: VideoElementPoolPresenter,
        canvasPresenter: CanvasPresenter,
    ) {
        this.state = state;
        this.videoPool = videoPool;
        this.canvasPresenter = canvasPresenter;
    }

    setCanvas = (canvas: HTMLCanvasElement | null) => {
        this.state.canvasRef = canvas;
        if (canvas) {
            this.state.ctx = canvas.getContext('2d', {
                alpha: false,
            });
        }
    }

    /**
     * Render during playback - videos play natively for smooth motion
     */
    renderPlayback(currentTime: number): void {
        const { canvasRef, ctx } = this.state;
        if (!ctx || !canvasRef) return;

        const activeClips = this.canvasPresenter.getCellsAtGlobalTime(currentTime);

        if (!activeClips?.length) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
            return;
        }
        
        activeClips.sort((a, b) => b.clipIndex - a.clipIndex);

        const videosToRender: Array<{
            video: HTMLVideoElement;
            clip: typeof activeClips[0]['clip'];
        }> = [];

        for (const { clip, clipTime } of activeClips) {
            const video = this.videoPool.get(clip.mediaNodeId);
            if (!video) continue;
            if (!VideoElementPoolPresenter.isReady(video)) continue;

            const trimStart = clip.trimStart || 0;
            const localTime = clipTime + trimStart;

            if (video.paused) {
                video.currentTime = localTime;
                video.play().catch(() => {});
                continue;
            }
            
            if (video.seeking) {
                continue;
            }

            // Only correct large drifts (> 500ms) to avoid stuttering
            const drift = video.currentTime - localTime;
            if (Math.abs(drift) > 0.5) {
                video.currentTime = localTime;
                continue;
            }

            videosToRender.push({ video, clip });
        }

        if (videosToRender.length === 0) return;

        // Draw all videos with their current frames - no waiting
        this.compositeFrame(ctx, canvasRef, videosToRender);
    }

    /**
     * Render when scrubbing/seeking (frame-accurate)
     */
    renderFrame(currentTime: number, isPlaying: boolean = false): void {
        if (isPlaying) return;
        
        const { canvasRef, ctx } = this.state;
        if (!ctx || !canvasRef) return;

        const activeClips = this.canvasPresenter.getCellsAtGlobalTime(currentTime);

        if (!activeClips?.length) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
            return;
        }
        
        activeClips.sort((a, b) => b.clipIndex - a.clipIndex);

        // Collect videos
        const videosToRender: Array<{
            video: HTMLVideoElement;
            clip: typeof activeClips[0]['clip'];
        }> = [];
        
        let allReady = true;

        for (const { clip, clipTime } of activeClips) {
            const video = this.videoPool.get(clip.mediaNodeId);
            if (!video) continue;
            if (!VideoElementPoolPresenter.isReady(video)) continue;

            const trimStart = clip.trimStart || 0;
            const localTime = clipTime + trimStart;

            if (!video.paused) {
                video.pause();
            }

            // Seek to target time if needed
            const drift = Math.abs(video.currentTime - localTime);
            if (drift > 0.04) {
                video.currentTime = localTime;
            }
            
            if (video.seeking) {
                allReady = false;
                video.addEventListener('seeked', () => {
                    // only render when seek is complete
                    this.renderFrame(currentTime, false);
                }, { once: true });
            }

            videosToRender.push({ video, clip });
        }

        // Skip render unless it is ready
        if (!allReady || videosToRender.length === 0) return;

        this.compositeFrame(ctx, canvasRef, videosToRender);
    }
    
    /**
     * Composite all videos onto the canvas
     */
    private compositeFrame(
        ctx: CanvasRenderingContext2D,
        canvasRef: HTMLCanvasElement,
        videosToRender: Array<{ video: HTMLVideoElement; clip: { trackId: number } }>
    ): void {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

        for (const { video, clip } of videosToRender) {
            const track = this.canvasPresenter.getTrack(clip.trackId);
            if (!track) {
                this.drawVideoFit(ctx, video, canvasRef.width, canvasRef.height);
            } else {
                const effects = track.effects || {};
                this.drawVideoWithEffects(ctx, video, canvasRef.width, canvasRef.height, effects);
            }
        }
    }

    private buildFilterString(effects: ClipEffects): string {
        const filters: string[] = [];

        if (effects.brightness !== undefined && effects.brightness !== 1) {
            filters.push(`brightness(${effects.brightness})`);
        }
        if (effects.contrast !== undefined && effects.contrast !== 1) {
            filters.push(`contrast(${effects.contrast})`);
        }
        if (effects.saturation !== undefined && effects.saturation !== 1) {
            filters.push(`saturate(${effects.saturation})`);
        }

        return filters.length > 0 ? filters.join(' ') : 'none';
    }

    private drawVideoWithEffects(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        video: HTMLVideoElement,
        canvasWidth: number,
        canvasHeight: number,
        effects: ClipEffects
    ) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (!videoWidth || !videoHeight) return;

        ctx.save();

        ctx.globalAlpha = effects.opacity ?? 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = this.buildFilterString(effects);

        const canvasAspect = canvasWidth / canvasHeight;
        const videoAspect = videoWidth / videoHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (videoAspect > canvasAspect) {
            drawHeight = canvasHeight;
            drawWidth = drawHeight * videoAspect;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvasWidth;
            drawHeight = drawWidth / videoAspect;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        }

        ctx.drawImage(
            video,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight
        );

        ctx.restore();
    }

    private drawVideoFit(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        video: HTMLVideoElement,
        canvasWidth: number,
        canvasHeight: number
    ) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (!videoWidth || !videoHeight) return;

        const canvasAspect = canvasWidth / canvasHeight;
        const videoAspect = videoWidth / videoHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Cover mode: fill canvas, crop overflow
        if (videoAspect > canvasAspect) {
            drawHeight = canvasHeight;
            drawWidth = drawHeight * videoAspect;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvasWidth;
            drawHeight = drawWidth / videoAspect;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        }

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    }

    resizeCanvas = (width: number, height: number, aspectRatio: string = '16:9') => {
        const { canvasRef } = this.state;
        if (!canvasRef) return;

        const [w, h] = aspectRatio.split(':').map(Number);
        const ratio = w / h;
        const containerAspect = width / height;

        let newWidth: number;
        let newHeight: number;

        if (containerAspect > ratio) {
            newHeight = Math.floor(height * window.devicePixelRatio);
            newWidth = Math.floor(newHeight * ratio);
        } else {
            newWidth = Math.floor(width * window.devicePixelRatio);
            newHeight = Math.floor(newWidth / ratio);
        }

        // Only resize if dimensions actually changed
        if (canvasRef.width !== newWidth || canvasRef.height !== newHeight) {
            canvasRef.width = newWidth;
            canvasRef.height = newHeight;
        }
    }

    clear() {
        const { ctx, canvasRef } = this.state;
        if (!ctx || !canvasRef) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    }
}