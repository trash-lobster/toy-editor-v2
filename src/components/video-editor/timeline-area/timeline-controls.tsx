interface TimelineControlsProps {
    tracks?: number;
    trackHeight: number;
    addTrack: () => void;
}

export function TimelineControls({ tracks = 0, trackHeight, addTrack }: TimelineControlsProps) {
    return (
        <div className="timeline-controls">
            <div>
                <button
                    className='timeline-add-track'
                    onClick={addTrack}
                >
                    Add track
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
