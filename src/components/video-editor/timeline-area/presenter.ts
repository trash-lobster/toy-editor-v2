import type { TimelineState } from "./state";

export class TimelinePresenter {
    state: TimelineState;

    constructor(state: TimelineState) {
        this.state = state;
    }

    handleClipSelect = (cellId: string, trackId: number, onClipSelect?: (cellId: string, trackId: number) => void) => {
        this.state.selectedClipId = cellId;

        if (onClipSelect) {
            onClipSelect(cellId, trackId);
        }
    }

    handleDragStart = (event: React.MouseEvent, startTime: number, cellId: string, pixelsPerSecond: number) => {
        this.state.isDragging = true;
        this.state.dragStartX = event.clientX;
        this.state.dragStartTime = startTime;
        this.state.selectedClipId = cellId;

        const handleMouseMove = (e: MouseEvent) => {
            if (!this.state.isDragging) return;
            const deltaX = e.clientX - this.state.dragStartX;
            const deltaTime = deltaX / pixelsPerSecond;
            // const newStartTime = Math.max(0, this.state.dragStartTime + deltaTime);

            // if (onClipMove) {
            //     onClipMove(cellId, newStartTime, trackId);
            // }
        };

        const handleMouseUp = () => {
            this.state.isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
}