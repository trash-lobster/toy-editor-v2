export class VirtualTimelineState {
    // only needs to know where in the time line it is 
    currentTime: number = 0;
    isPlaying: boolean = false;
    totalDuration: number = 0;

    masterClockRef: number | null = null;
    lastFrameTime: number = 0;
}