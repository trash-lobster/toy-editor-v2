import { useSnapshot } from "valtio/react";
import { VideoPlayback as InternalVideoPlayback } from "./video-playback";
import type { VirtualTimelineState } from "../state";
import type { PlaybackEnginePresenter } from "./engine/presenter";

export function installVideoPlayback(
    playbackEngine: PlaybackEnginePresenter, // enables play back etc.
    virtualTimelinestate: VirtualTimelineState,
) {    
    const VideoPlayback = () => {
        const { isPlaying, currentTime, totalDuration } = useSnapshot(virtualTimelinestate);
        
        return (
            <InternalVideoPlayback
                isPlaying={isPlaying}
                globalTime={currentTime}
                totalDuration={totalDuration}
                onSkipNext={playbackEngine.skipForward}
                onSkipPrevious={playbackEngine.skipBackward}
                onTogglePlayback={playbackEngine.togglePlayback}
            />
        );
    };
    
    return {
        VideoPlayback
    };
}
