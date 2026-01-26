import type { VirtualTimelineState } from "../../state";
import type { VideoElementPoolPresenter } from "../video-element-pool/presenter";
import type { CanvasCompositorPresenter } from "../canvas-compositor/presenter";
import type { CanvasPresenter } from "../../../canvas/presenter";

/**
 * PlaybackEngine manages the video playback loop using requestAnimationFrame.
 * Coordinates VideoElementPool and CanvasCompositor to render multi-track video.
 */
export class PlaybackEnginePresenter {
    // canvasState: CanvasState;
    virtualTimelineState: VirtualTimelineState;
    videoPool: VideoElementPoolPresenter;
    compositor: CanvasCompositorPresenter;
    canvasPresenter: CanvasPresenter;

    rafId: number | null = null;
    lastFrameTime: number = 0;

    constructor(
        // canvasState: CanvasState,
        virtualTimelineState: VirtualTimelineState,
        videoPool: VideoElementPoolPresenter,
        compositor: CanvasCompositorPresenter,
        canvasPresenter: CanvasPresenter
    ) {
        // this.canvasState = canvasState;
        this.virtualTimelineState = virtualTimelineState;
        this.videoPool = videoPool;
        this.compositor = compositor;
        this.canvasPresenter = canvasPresenter;
    }

    /**
     * Start playback loop.
     * Updates VirtualTimelineState.isPlaying which triggers UI re-render.
     */
    play = (): void => {
        if (this.virtualTimelineState.isPlaying) return;

        this.virtualTimelineState.isPlaying = true;
       
        // Initialize RAF loop
        this.lastFrameTime = performance.now();
        this.tick(this.lastFrameTime);
    };

    /**
     * Pause playback loop.
     * Cancels RAF and pauses all videos in pool.
     */
    pause = (): void => {
        this.virtualTimelineState.isPlaying = false;
        
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // Pause all video elements to free decoder resources
        this.videoPool.pauseAll();
    };

    /**
     * Toggle play/pause.
     */
    togglePlayback = (): void => {
        if (this.virtualTimelineState.isPlaying) {
            this.pause();
            console.log('pausing');
        } else {
            this.play();
            console.log('playing');
        }
    };

    /**
     * Seek to a specific time in seconds.
     * Updates currentTime and renders a single frame.
     */
    seek = (time: number): void => {
        const totalDuration = this.virtualTimelineState.totalDuration;
        this.virtualTimelineState.currentTime = Math.max(0, Math.min(time, totalDuration));
        
        this.compositor.render(this.virtualTimelineState.currentTime);
    };

    /**
     * Main animation loop tick.
     * Called by requestAnimationFrame at ~60fps.
     */
    private tick = (timestamp: number): void => {
        if (!this.virtualTimelineState.isPlaying) {
            this.rafId = null;
            return;
        }

        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        const newTime = this.virtualTimelineState.currentTime + deltaTime;
        const totalDuration = this.virtualTimelineState.totalDuration;

        if (newTime >= totalDuration) {
            this.virtualTimelineState.currentTime = totalDuration;
            this.pause();
            
            this.compositor.render(totalDuration);
            return;
        }

        this.virtualTimelineState.currentTime = newTime;

        this.compositor.render(newTime);

        this.rafId = requestAnimationFrame(this.tick);
    };

    /**
     * Preload all videos in the timeline.
     * Should be called after uploading media or when timeline changes.
     */
    preloadVideos = async (): Promise<void> => {
        const nodes = this.canvasPresenter.getNodes();
        const videoNodes = nodes.filter(node => node.type === 'video');

        const results = await this.videoPool.loadBatch(videoNodes);
        
        if (results.failed.length > 0) {
            console.error(`Failed to preload ${results.failed.length} videos:`, results.failed);
        }
        
        console.log(`✅ Preloaded ${results.loaded.length} videos`);
    };

    /**
     * Jump forward by a fixed amount (e.g., 5 seconds).
     */
    skipForward = (seconds: number = 5): void => {
        const newTime = this.virtualTimelineState.currentTime + seconds;
        this.seek(newTime);
        console.log('new time', newTime);
    };

    /**
     * Jump backward by a fixed amount (e.g., 5 seconds).
     */
    skipBackward = (seconds: number = 5): void => {
        console.log(seconds);
        const newTime = this.virtualTimelineState.currentTime - seconds;
        console.log('new time', newTime);
        this.seek(newTime);
    };

    /**
     * Reset playback to beginning.
     */
    reset = (): void => {
        this.pause();
        this.seek(0);
    };

    /**
     * Get current playback state
     */
    getPlaybackState = () => {
        return {
            isPlaying: this.virtualTimelineState.isPlaying,
            currentTime: this.virtualTimelineState.currentTime,
            totalDuration: this.virtualTimelineState.totalDuration,
            fps: this.calculateFPS(),
            videosLoaded: this.videoPool.size
        };
    };

    /**
     * Calculate approximate FPS based on RAF timing.
     */
    private calculateFPS = (): number => {
        if (this.lastFrameTime === 0) return 0;
        const deltaTime = (performance.now() - this.lastFrameTime) / 1000;
        return deltaTime > 0 ? Math.round(1 / deltaTime) : 0;
    };

    /**
     * Clean up resources when component unmounts (e.g. in useEffect).
     */
    dispose = (): void => {
        this.pause();
        this.videoPool.disposeAll();
        this.compositor.clear();
    };
}