import { proxy } from "valtio";

export class TimelineState {
    selectedClipId: string | null = null;
    isDragging: boolean = false;
    dragStartX: number = 0;
    dragStartTime: number = 0;
}

export function createTimelineState() {
    return proxy(new TimelineState());
}