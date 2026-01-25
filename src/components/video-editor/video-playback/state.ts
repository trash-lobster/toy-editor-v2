import { proxy } from "valtio";

export class VideoPlaybackState {
    isPlaying: boolean = false;
    globalTime: number = 0;
    totalDuration: number = 0;
}

export function createVideoPlaybackState() {
    return proxy(new VideoPlaybackState());
}
