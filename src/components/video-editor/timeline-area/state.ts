import { proxy } from "valtio";

export class TimelineState {
    selectedClipId: string | null = null;
    isDragging: boolean = false;
    dragStartX: number = 0;
    dragStartY: number = 0;
    dragStartTime: number = 0;
    originalStartTime: number = 0;
    originalTrackId: number = 0;
    dragPreviewOffset: number = 0;
    currentDragTrackId: number = 0;
    wasPlayingBeforeDrag: boolean = false;
    // Trimming state
    isTrimming: boolean = false;
    trimmingSide: 'left' | 'right' | null = null;
    trimmingClipId: string | null = null;
    originalTrimStart: number = 0;
    originalTrimEnd: number = 0;
    trimStartClientX: number = 0;
    wasPlayingBeforeTrim: boolean = false;
}

export function createTimelineState() {
    return proxy(new TimelineState());
}