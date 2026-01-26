import type { TimelineState } from "./state";
import type { CanvasPresenter } from "../../canvas/presenter";

export class TimelinePresenter {
    state: TimelineState;
    canvasPresenter: CanvasPresenter | null = null;
    trackHeight: number = 80;

    constructor(state: TimelineState) {
        this.state = state;
    }

    setCanvasPresenter(canvasPresenter: CanvasPresenter) {
        this.canvasPresenter = canvasPresenter;
    }

    setTrackHeight(trackHeight: number) {
        this.trackHeight = trackHeight;
    }

    handleClipSelect = (cellId: string, trackId: number, onClipSelect?: (cellId: string, trackId: number) => void) => {
        this.state.selectedClipId = cellId;

        if (onClipSelect) {
            onClipSelect(cellId, trackId);
        }
    }

    handleDragStart = (event: React.MouseEvent, startTime: number, cellId: string, trackId: number, duration: number, pixelsPerSecond: number, trackHeight: number) => {
        if (!this.canvasPresenter) return;

        this.state.isDragging = true;
        this.state.dragStartX = event.clientX;
        this.state.dragStartY = event.clientY;
        this.state.dragStartTime = startTime;
        this.state.originalStartTime = startTime;
        this.state.originalTrackId = trackId;
        this.state.currentDragTrackId = trackId;
        this.state.selectedClipId = cellId;
        this.state.dragPreviewOffset = 0;

        let rafId: number | null = null;
        const canvasPresenter = this.canvasPresenter;

        const handleMouseMove = (e: MouseEvent) => {
            if (!this.state.isDragging) return;
            if (rafId) return; // Skip if update pending

            rafId = requestAnimationFrame(() => {
                const deltaX = e.clientX - this.state.dragStartX;
                const deltaY = e.clientY - this.state.dragStartY;
                
                // Update visual preview offset (pixels)
                this.state.dragPreviewOffset = deltaX;

                // Calculate target track from Y position
                const trackDelta = Math.round(deltaY / trackHeight);
                const newTrackId = Math.max(0, this.state.originalTrackId + trackDelta);
                this.state.currentDragTrackId = newTrackId;

                rafId = null;
            });
        };

        const handleMouseUp = () => {
            if (rafId) cancelAnimationFrame(rafId);
            
            this.state.isDragging = false;
            
            // Calculate final position
            const deltaX = this.state.dragPreviewOffset;
            const deltaTime = deltaX / pixelsPerSecond;
            const newStartTime = Math.max(0, this.state.originalStartTime + deltaTime);
            const targetTrackId = this.state.currentDragTrackId;

            // Check collision
            const collision = canvasPresenter.checkCollision(cellId, targetTrackId, newStartTime, duration);

            if (collision.valid && collision.swapTarget) {
                // Swap with target clip
                canvasPresenter.swapClips(cellId, this.state.originalTrackId, collision.swapTarget, targetTrackId);
            } else if (collision.valid && !collision.swapTarget) {
                // Valid drop - move clip (use snapTime if available)
                const finalStartTime = collision.snapTime !== undefined ? collision.snapTime : newStartTime;
                if (targetTrackId !== this.state.originalTrackId) {
                    // Move to different track
                    canvasPresenter.moveClipToTrack(cellId, this.state.originalTrackId, targetTrackId, finalStartTime);
                } else {
                    // Same track, just update time
                    canvasPresenter.moveClip(cellId, finalStartTime, targetTrackId);
                }
            }
            // else: invalid drop, clip returns to original position automatically (no state change)

            // Reset drag preview and deselect clip
            this.state.dragPreviewOffset = 0;
            this.state.selectedClipId = null;
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
}