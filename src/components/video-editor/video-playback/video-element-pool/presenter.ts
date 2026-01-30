import type { MediaNode } from "../../../canvas/state";
import type { VideoElementPoolState } from "./state";

export class VideoElementPoolPresenter {
    state: VideoElementPoolState;
    
    constructor(state: VideoElementPoolState) {
        this.state = state;
    }

    /**
     * Get a video element by media node ID without loading.
     * Returns undefined if not in pool.
     */
    get(mediaNodeId: string): HTMLVideoElement | undefined | null {
        return this.state.videos.get(mediaNodeId);
    }

    /**
     * Check if a video element exists in the pool.
     */
    has(mediaNodeId: string): boolean {
        return this.state.videos.has(mediaNodeId);
    }

    get size(): number {
        return this.state.videos.size;
    }

    addVideoToPool = (id: string, videoElement: HTMLVideoElement) => {
        videoElement.preload = videoElement.preload || 'auto';
        videoElement.muted = true;
        videoElement.playsInline = true;
        this.state.videos.set(id, videoElement);
    }

    clearVideoFromPool = (id: string) => {
        this.state.videos.set(id, null);
    }

    /**
     * Load or retrieve a video element for a media node.
     * Creates and caches video elements on first access.
     */
    async load(mediaNode: MediaNode): Promise<HTMLVideoElement> {
        const existingVideo = this.state.videos.get(mediaNode.id);
        if (existingVideo) {
            return existingVideo;
        }

        const video = document.createElement('video');
        video.src = mediaNode.data.url;
        video.preload = 'auto';
        video.muted = true; // Start muted for multi-track testing
        video.playsInline = true; // Important for mobile
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
            video.onloadeddata = () => resolve();
            video.onerror = () => reject(new Error(`Failed to load video: ${mediaNode.label}`));
            
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error(`Video load timeout: ${mediaNode.label}`)), 10000);
        });

        this.addVideoToPool(mediaNode.id, video);
        return video;
    }

    async loadBatch(mediaNodes: MediaNode[]): Promise<{
        loaded: MediaNode[];
        failed: Array<{ node: MediaNode; error: Error }>;
    }> {
        const results = await Promise.allSettled(
            mediaNodes.map(node => this.load(node).then(() => node))
        );

        const loaded: MediaNode[] = [];
        const failed: Array<{ node: MediaNode; error: Error }> = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                loaded.push(result.value);
            } else {
                failed.push({
                    node: mediaNodes[index],
                    error: result.reason
                });
            }
        });

        return { loaded, failed };
    }


    /**
     * Seek a video to a specific time with tolerance to avoid excessive seeking.
     * Only seeks if difference is greater than tolerance threshold.
     */
    seek(video: HTMLVideoElement, targetTime: number, tolerance: number = 0.1): void {
        const currentTime = video.currentTime;
        const diff = Math.abs(currentTime - targetTime);
        
        // Only seek if difference exceeds tolerance
        if (diff > tolerance) {
            video.currentTime = targetTime;
        }
    }

    /**
     * Batch seek multiple videos at once.
     * Useful for syncing multiple tracks to the same time.
     */
    seekMultiple(seeks: Array<{ video: HTMLVideoElement; targetTime: number }>, tolerance: number = 0.1): void {
        seeks.forEach(({ video, targetTime }) => {
            this.seek(video, targetTime, tolerance);
        });
    }

    static isReady(video: HTMLVideoElement): boolean {
        return video.readyState >= 2; // HAVE_CURRENT_DATA or better
    }

    static isSeeking(video: HTMLVideoElement): boolean {
        return video.seeking;
    }

    dispose(mediaNodeId: string): void {
        const video = this.state.videos.get(mediaNodeId);
        if (video) {
            video.pause();
            video.src = '';
            video.load(); // Reset video element
            this.state.videos.delete(mediaNodeId);
        }
    }

    disposeMultiple(mediaNodeIds: string[]): void {
        mediaNodeIds.forEach(id => this.dispose(id));
    }

    disposeAll(): void {
        this.state.videos.forEach((video) => {
            if (!video) return;
            video.pause();
            video.src = '';
            video.load();
        });
        this.state.videos.clear();
    }

    getAllIds(): string[] {
        return Array.from(this.state.videos.keys());
    }

    /**
     * Get video metadata for a loaded video.
     */
    getMetadata(mediaNodeId: string): {
        duration: number;
        width: number;
        height: number;
        readyState: number;
    } | null {
        const video = this.state.videos.get(mediaNodeId);
        if (!video) return null;

        return {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
        };
    }

    pauseAll(): void {
        this.state.videos.forEach(video => {
            if (!video) return;
            if (!video.paused) {
                video.pause();
            }
        });
    }
}