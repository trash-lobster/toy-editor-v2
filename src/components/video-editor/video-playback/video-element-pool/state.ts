export class VideoElementPoolState {
    // holds reference to the video element DOM
    videos: Map<string, HTMLVideoElement | null>;

    constructor() {
        this.videos = new Map();
    }
}

export function createVideoElementPool() {
    return new VideoElementPoolState();
}