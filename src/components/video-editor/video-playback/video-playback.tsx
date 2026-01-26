import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface props {
    isPlaying: boolean,
    globalTime: number,
    totalDuration: number,
    onSkipPrevious: () => void,
    onTogglePlayback: () => void,
    onSkipNext: () => void,
}

export function VideoPlaybackPanel({ 
    isPlaying, 
    globalTime, 
    totalDuration,
    onSkipPrevious,
    onSkipNext,
    onTogglePlayback,
}: props) {
    return (
        <div className="video-playback-panel">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => onSkipPrevious()}
                    disabled={globalTime <= 0}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-3 text-filmforge-text hover:bg-transparent"
                >
                    <SkipBack className="w-4 h-4" fill="currentColor" />
                </button>

                <button
                    onClick={onTogglePlayback}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-3 text-filmforge-text hover:bg-transparent"
                >
                    {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
                </button>

                <button
                    onClick={() => onSkipNext()}
                    disabled={globalTime >= totalDuration}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-3 text-filmforge-text hover:bg-transparent"
                >
                    <SkipForward className="w-4 h-4" fill="currentColor" />
                </button>
            </div>
            
            {/* Time Display */}
            <div className="flex items-center gap-2">
                <span>{globalTime.toFixed(1)}s</span>
                <span>/</span>
                <span>{totalDuration.toFixed(1)}s</span>
            </div>
        </div>
    );
}