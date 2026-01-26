import { useSnapshot } from "valtio/react";
import { VideoPlaybackPanel as InternalVideoPlayback } from "./video-playback";
import type { VirtualTimelineState } from "../state";
import type { PlaybackEngine } from "./engine/presenter";

export function installVideoPlaybackPanel(
    playbackEngine: PlaybackEngine, // enables play back etc.
    virtualTimelinestate: VirtualTimelineState,
) {    
    const VideoPlaybackPanel = () => {
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
        VideoPlaybackPanel
    };
}
