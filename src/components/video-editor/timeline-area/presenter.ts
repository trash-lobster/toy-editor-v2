import type { TimelineState } from "./state";
import type { CanvasPresenter } from "../../canvas/presenter";
import type { PlaybackController } from "../video-playback/engine/presenter";

export class TimelinePresenter {
    state: TimelineState;
    canvasPresenter: CanvasPresenter | null = null;
    playbackController: PlaybackController | null = null;
    trackHeight: number = 80;

    constructor(state: TimelineState, canvasPresenter: CanvasPresenter, playbackController: PlaybackController) {
        this.state = state;
        this.canvasPresenter = canvasPresenter;
        this.playbackController = playbackController;
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

        const wasPlaying = this.playbackController?.virtualTimelineState.isPlaying ?? false;
        this.state.wasPlayingBeforeDrag = wasPlaying;
        if (wasPlaying) {
            this.playbackController?.pause();
        }

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
            
            // restart play after drag completes
            if (this.state.wasPlayingBeforeDrag && this.playbackController) {
                this.playbackController.play();
                this.state.wasPlayingBeforeDrag = false;
            }

            // Reset drag preview and deselect clip
            this.state.dragPreviewOffset = 0;
            this.state.selectedClipId = null;
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    handleTrimStart = (event: React.MouseEvent, side: 'left' | 'right', cellId: string, trackId: number, pixelsPerSecond: number) => {
        if (!this.canvasPresenter) return;

        const track = this.canvasPresenter.getTrack(trackId);
        if (!track) return;

        const clip = track.cells.find(c => c.id === cellId);
        if (!clip) return;

        const MIN_CLIP_LENGTH = 0.1;

        const wasPlaying = this.playbackController?.virtualTimelineState.isPlaying ?? false;
        this.state.wasPlayingBeforeTrim = wasPlaying;
        if (wasPlaying) this.playbackController?.pause();

        this.state.isTrimming = true;
        this.state.trimmingSide = side;
        this.state.trimmingClipId = cellId;
        this.state.trimStartClientX = event.clientX;
        this.state.originalTrimStart = clip.trimStart || 0;
        this.state.originalTrimEnd = clip.trimEnd || 0;

        let rafId: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            if (!this.state.isTrimming) return;
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                const deltaX = e.clientX - this.state.trimStartClientX;
                const deltaSec = deltaX / pixelsPerSecond;

                const sourceDuration = clip.duration || 0;

                if (side === 'left') {
                    let candidate = this.state.originalTrimStart + deltaSec;
                    const maxTrim = Math.max(0, sourceDuration - this.state.originalTrimEnd - MIN_CLIP_LENGTH);
                    const newTrimStart = Math.max(0, Math.min(candidate, maxTrim));
                    this.canvasPresenter?.updateClip(cellId, { trimStart: newTrimStart }, trackId);
                } else {
                    // right side
                    let candidate = this.state.originalTrimEnd - deltaSec;
                    const maxTrim = Math.max(0, sourceDuration - this.state.originalTrimStart - MIN_CLIP_LENGTH);
                    const newTrimEnd = Math.max(0, Math.min(candidate, maxTrim));
                    this.canvasPresenter?.updateClip(cellId, { trimEnd: newTrimEnd }, trackId);
                }

                rafId = null;
            });
        };

        const handleMouseUp = () => {
            if (rafId) cancelAnimationFrame(rafId);

            this.state.isTrimming = false;
            this.state.trimmingSide = null;
            this.state.trimmingClipId = null;
            this.state.trimStartClientX = 0;

            if (this.state.wasPlayingBeforeTrim && this.playbackController) {
                this.playbackController.play();
                this.state.wasPlayingBeforeTrim = false;
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
}