import { useSnapshot } from "valtio/react";
import { VideoPlaybackButtons, TimeDisplay } from "./video-playback";
import type { VirtualTimelineState } from "../state";
import type { PlaybackController } from "./engine/presenter";

export function installVideoPlaybackPanel(
    playbackController: PlaybackController, // enables play back etc.
    virtualTimelinestate: VirtualTimelineState,
) {    
    const VideoPlaybackPanel = () => {
        const { isPlaying, currentTime, totalDuration } = useSnapshot(virtualTimelinestate);
        const disableSkipPrevious = currentTime <= 0;
        const disableSkipNext = currentTime >= totalDuration;

        return (
            <div className="video-playback-panel">
                <VideoPlaybackButtons
                    isPlaying={isPlaying}
                    disableSkipNext={disableSkipNext}
                    disableSkipPrevious={disableSkipPrevious}
                    onSkipNext={playbackController.skipForward}
                    onSkipPrevious={playbackController.skipBackward}
                    onTogglePlayback={playbackController.togglePlayback}
                />
                <TimeDisplay
                    globalTime={currentTime}
                    totalDuration={totalDuration}
                />
            </div>
        );
    };
    
    return {
        VideoPlaybackPanel
    };
}
