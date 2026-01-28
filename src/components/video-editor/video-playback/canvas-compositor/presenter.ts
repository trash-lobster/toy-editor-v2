import type { CanvasPresenter } from "../../../canvas/presenter";
import type { ClipEffects } from "../../../canvas/state";
import { VideoElementPoolPresenter } from "../video-element-pool/presenter";
import type { CanvasCompositorState } from "./state";

// canvas-compositor/presenter.ts
export class CanvasCompositor {
    state: CanvasCompositorState;
    videoPool: VideoElementPoolPresenter;
    canvasPresenter: CanvasPresenter;
    private pendingSeekRender: number | null = null;
    private seekedHandlers: Map<HTMLVideoElement, () => void> = new Map();

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
                alpha: false, // to allow multitrack videos to overlay on top of each other
                desynchronized: true
            });
        }
    }

    /**
     * Schedule a re-render when a video finishes seeking.
     * Uses a one-time event listener to avoid memory leaks.
     */
    private scheduleRenderOnSeeked(video: HTMLVideoElement, currentTime: number): void {
        // Remove any existing handler for this video
        const existingHandler = this.seekedHandlers.get(video);
        if (existingHandler) {
            video.removeEventListener('seeked', existingHandler);
        }

        const handler = () => {
            video.removeEventListener('seeked', handler);
            this.seekedHandlers.delete(video);
            
            // Cancel any pending render frame
            if (this.pendingSeekRender !== null) {
                cancelAnimationFrame(this.pendingSeekRender);
            }
            
            // Schedule render on next animation frame
            this.pendingSeekRender = requestAnimationFrame(() => {
                this.pendingSeekRender = null;
                this.render(currentTime, false);
            });
        };

        this.seekedHandlers.set(video, handler);
        video.addEventListener('seeked', handler, { once: true });
    }

    /**
     * @param isPlaying Determines if the clip should be playing when rendering. It should not play if it's a scrubbing motion
     */
    render(currentTime: number, isPlaying: boolean = false) {
        const { canvasRef, ctx } = this.state;
        if (!ctx || !canvasRef) return;

        const activeClips = this.canvasPresenter.getCellsAtGlobalTime(currentTime);

        if (!activeClips?.length) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
            return;
        }
        
        activeClips.sort((a, b) => b.clipIndex - a.clipIndex);

        let anyDrawn = false;

        for (const { clip, clipTime } of activeClips) {
            const video = this.videoPool.get(clip.mediaNodeId);
            if (!video) continue;
            if (!VideoElementPoolPresenter.isReady(video)) continue;

            // Skip drawing if video is currently seeking (causes flicker)
            if (video.seeking) {
                continue;
            }

            const trimStart = clip.trimStart || 0;
            const localTime = clipTime + trimStart;

            if (isPlaying) {
                // During playback: let video play naturally
                if (video.paused) {
                    video.currentTime = localTime;
                    video.play().catch(() => {}); // Ignore autoplay errors
                    continue; // Skip this frame, wait for play to start
                }
                
                const drift = video.currentTime - localTime;
                if (Math.abs(drift) > 0.2) {
                    // Large drift - hard sync (will cause a brief seek)
                    video.currentTime = localTime;
                    if (video.seeking) {
                        this.scheduleRenderOnSeeked(video, currentTime);
                        continue;
                    }
                }
            } else {
                // When paused/scrubbing: seek to frame
                if (!video.paused) {
                    video.pause();
                }
                const drift = Math.abs(video.currentTime - localTime);
                if (drift > 0.05) {
                    this.videoPool.seek(video, localTime, 0.01); // ~1 frame tolerance
                    // Don't draw while seeking - schedule re-render when seek completes
                    if (video.seeking) {
                        this.scheduleRenderOnSeeked(video, currentTime);
                        continue;
                    }
                }
            }

            if (!anyDrawn) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
                anyDrawn = true;
            }

            const track = this.canvasPresenter.getTrack(clip.trackId);
            if (!track) {
                this.drawVideoFit(ctx, video, canvasRef.width, canvasRef.height,);
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

        // Apply opacity
        ctx.globalAlpha = effects.opacity ?? 1;

        // Apply blend mode
        ctx.globalCompositeOperation = 'source-over';

        // Apply CSS filters (brightness, contrast, saturation, hue, etc.)
        ctx.filter = this.buildFilterString(effects);

        // Calculate base fit dimensions
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