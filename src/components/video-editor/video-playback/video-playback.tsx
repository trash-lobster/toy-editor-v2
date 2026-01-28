import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { memo } from "react";

interface props {
    isPlaying: boolean,
    disableSkipPrevious: boolean,
    disableSkipNext: boolean,
    onSkipPrevious: () => void,
    onTogglePlayback: () => void,
    onSkipNext: () => void,
}

export const VideoPlaybackButtons = memo(function PlaybackControls({ 
    isPlaying, 
    disableSkipNext, 
    disableSkipPrevious,
    onSkipPrevious,
    onSkipNext,
    onTogglePlayback,
}: props) {


    return (
        <div className="flex items-center gap-6">
            <button
                onClick={() => onSkipPrevious()}
                disabled={disableSkipPrevious}
                className="video-playback-panel-button whitespace-nowrap text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-3"
            >
                <SkipBack className="w-4 h-4" fill="currentColor" />
            </button>

            <button
                onClick={onTogglePlayback}
                className="video-playback-panel-button whitespace-nowrap text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-3"
            >
                {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
            </button>

            <button
                onClick={() => onSkipNext()}
                disabled={disableSkipNext}
                className="video-playback-panel-button whitespace-nowrap text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-3"
            >
                <SkipForward className="w-4 h-4" fill="currentColor" />
            </button>
        </div>
    );
});

interface TimeDisplayProps {
    globalTime: number; 
    totalDuration: number;
}

export function TimeDisplay({ 
    globalTime, 
    totalDuration 
}: TimeDisplayProps) {
    return (
        <div className="flex items-center gap-2">
            <span>{globalTime.toFixed(1)}s</span>
            <span>/</span>
            <span>{totalDuration.toFixed(1)}s</span>
        </div>
    );
}