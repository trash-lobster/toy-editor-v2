import type { CanvasPresenter } from "../../../canvas/presenter";
import { VideoElementPoolPresenter } from "../video-element-pool/presenter";
import type { CanvasCompositorState } from "./state";

// canvas-compositor/presenter.ts
export class CanvasCompositor {
    state: CanvasCompositorState;
    videoPool: VideoElementPoolPresenter;
    canvasPresenter: CanvasPresenter;
    // offscreenCanvas: OffscreenCanvas;

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
                desynchronized: true
            });

            this.state.offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
            this.state.offScnCtx = this.state.offscreenCanvas.getContext('2d');
        }
    }

    /**
     * @param isPlaying Determines if the clip should be playing when rendering. It should not play if it's a scrubbing motion
     */
    render(currentTime: number, isPlaying: boolean = false) {
        const { canvasRef, ctx, offScnCtx, offscreenCanvas } = this.state;
        if (!ctx || !canvasRef || !offScnCtx || !offscreenCanvas) return;

        const activeClips = this.canvasPresenter.getCellsAtGlobalTime(currentTime);

        if (!activeClips?.length) {
            // Clear to black when no clips
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

            return;
        }
        
        activeClips.sort((a, b) => b.clipIndex - a.clipIndex);

        // Track if any video is seeking or if we drew anything
        let anyVideoSeeking = false;
        let anyVideoDrawn = false;

        // Clear offscreen buffer
        offScnCtx.fillStyle = '#000000';
        offScnCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

        for (const { clip, clipTime } of activeClips) {
            const video = this.videoPool.get(clip.mediaNodeId);
            if (!video) continue;
            if (!VideoElementPoolPresenter.isReady(video)) continue;

            // Skip drawing if video is currently seeking (causes flicker)
            if (video.seeking) {
                anyVideoSeeking = true;
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
                } else {
                    video.playbackRate = 1.0;
                }
            } else {
                // When paused/scrubbing: seek to frame
                if (!video.paused) {
                    video.pause();
                }
                const drift = Math.abs(video.currentTime - localTime);
                if (drift > 0.05) {
                    this.videoPool.seek(video, localTime, 0.01); // ~1 frame tolerance
                    // Don't draw while seeking
                    if (video.seeking) {
                        anyVideoSeeking = true;
                        continue;
                    }
                }
            }

            this.drawVideoFit(offScnCtx, video, canvasRef.width, canvasRef.height);
            anyVideoDrawn = true;
        }

        if (anyVideoDrawn || !anyVideoSeeking) {
            ctx.drawImage(offscreenCanvas, 0, 0);
        }
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

            // Also resize the offscreen canvas to match
            if (this.state.offscreenCanvas) {
                this.state.offscreenCanvas = new OffscreenCanvas(newWidth, newHeight);
                this.state.offScnCtx = this.state.offscreenCanvas.getContext('2d');
            }
        }
    }

    clear() {
        const { ctx, canvasRef } = this.state;
        if (!ctx || !canvasRef) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    }
}