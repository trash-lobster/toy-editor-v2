import { TRACK_LIMIT } from "../../canvas/presenter";

interface TimelineControlsProps {
    tracks?: number;
    trackHeight: number;
    addTrack: () => void;
    setAsCurrentTrack: (val : number) => void;
    currentTrack: number;
}

export function TimelineControls({ 
    tracks = 0, 
    trackHeight, 
    addTrack,
    currentTrack,
    setAsCurrentTrack,
}: TimelineControlsProps) {
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
                        <button
                            key={trackIndex}
                            className={`timeline-track-label`}
                            style={{ 
                                height: `${trackHeight}px`,
                                cursor: `${currentTrack === trackIndex ? 'default' : 'pointer'}`,
                                backgroundColor: `${currentTrack === trackIndex ? '#d2d2d2' : 'white'}`,
                            }}
                            onClick={() => setAsCurrentTrack(trackIndex)}
                            disabled={currentTrack === trackIndex}
                        >
                            Track {trackIndex + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
