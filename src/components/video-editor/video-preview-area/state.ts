import { proxy } from "valtio";
import type { SceneEditorCell } from "../../canvas/state";

export class VideoPlayerState {
    currentClip: SceneEditorCell | null = null;
    seekTime: number = 0;
    mediaUrl?: string;
}

export function createVideoPlayerState() {
    return proxy(new VideoPlayerState);
}