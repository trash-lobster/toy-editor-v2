import { TRACK_LIMIT } from "../../canvas/presenter";

interface TimelineControlsProps {
    tracks?: number;
    trackHeight: number;
    addTrack: () => void;
}

export function TimelineControls({ tracks = 0, trackHeight, addTrack }: TimelineControlsProps) {
    const isMaxTracks = tracks >= TRACK_LIMIT;
    
    return (
        <div className="timeline-controls">
            <div>
                <button
                    className={`timeline-add-track ${isMaxTracks ? 'disabled' : ''}`}
                    onClick={addTrack}
                    disabled={isMaxTracks}
                >
                    {isMaxTracks ? 'Track limit reached' : 'Add track'}
                </button>
                <div style={{borderRight: '1px solid black'}}>
                    {/* Track labels */}
                    {Array.from({length: tracks}).map((_, trackIndex) => (
                        <div
                            key={trackIndex}
                            className="timeline-track-label"
                            style={{ height: `${trackHeight}px`, }}
                        >
                            Track {trackIndex + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
