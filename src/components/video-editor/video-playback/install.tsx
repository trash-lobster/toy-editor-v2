import { useSnapshot } from "valtio/react";
import { VideoPlaybackPanel as InternalVideoPlayback } from "./video-playback";
import type { VirtualTimelineState } from "../state";
import type { PlaybackController } from "./engine/presenter";

export function installVideoPlaybackPanel(
    playbackController: PlaybackController, // enables play back etc.
    virtualTimelinestate: VirtualTimelineState,
) {    
    const VideoPlaybackPanel = () => {
        const { isPlaying, currentTime, totalDuration } = useSnapshot(virtualTimelinestate);
        
        return (
            <InternalVideoPlayback
                isPlaying={isPlaying}
                globalTime={currentTime}
                totalDuration={totalDuration}
                onSkipNext={playbackController.skipForward}
                onSkipPrevious={playbackController.skipBackward}
                onTogglePlayback={playbackController.togglePlayback}
            />
        );
    };
    
    return {
        VideoPlaybackPanel
    };
}
