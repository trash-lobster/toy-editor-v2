import type { CanvasPresenter } from "../../../canvas/presenter";
import { VideoElementPoolPresenter } from "../video-element-pool/presenter";
import type { CanvasCompositorState } from "./state";

// canvas-compositor/presenter.ts
export class CanvasCompositor {
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
        console.log(canvas);
        this.state.canvasRef = canvas;
        if (canvas) {
            this.state.ctx = canvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });
        }
    }

    render(currentTime: number) {
        const { canvasRef, ctx } = this.state;
        if (!ctx || !canvasRef) return;
        
        console.log('renderng:', currentTime);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
        
        const activeClips = this.canvasPresenter.getCellsAtGlobalTime(currentTime);
        if (!activeClips?.length) return;
        
        // Sort by track (visually top track should be drawn at the top)
        activeClips.sort((a, b) => b.clipIndex - a.clipIndex);

        // future optimization - if top is playing with no opacity effect, don't load the ones below?
        for (const { clip, clipTime } of activeClips) {
            // TODO: video pool is not generated to match the clip
            const video = this.videoPool.get(clip.mediaNodeId);
            if (!video) continue;
            if (!VideoElementPoolPresenter.isReady(video)) continue;

            // Calculate local time with trim offset
            const trimStart = clip.trimStart || 0;
            const localTime = clipTime + trimStart;

            // Seek video
            this.videoPool.seek(video, localTime, 0.1);

            // Draw video
            this.drawVideoFit(ctx, video, canvasRef.width, canvasRef.height);
        }
    }

    private drawVideoFit(
        ctx: CanvasRenderingContext2D,
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

    resizeCanvas(width: number, height: number, aspectRatio: string = '16:9') {
        const { canvasRef } = this.state;
        if (!canvasRef) return;

        const [w, h] = aspectRatio.split(':').map(Number);
        const ratio = w / h;
        const containerAspect = width / height;

        if (containerAspect > ratio) {
            canvasRef.height = height;
            canvasRef.width = height * ratio;
        } else {
            canvasRef.width = width;
            canvasRef.height = width / ratio;
        }
    }

    clear() {
        const { ctx, canvasRef } = this.state;
        if (!ctx || !canvasRef) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    }
}