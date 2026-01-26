interface TimelineControlsProps {
    tracks?: number;
    trackHeight: number;
    addTrack: () => void;
}

export function TimelineControls({ tracks = 0, trackHeight, addTrack }: TimelineControlsProps) {
    return (
        <div className="timeline-controls" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            position: 'sticky',
            left: 0,
            zIndex: 10,
            flexShrink: 0,
        }}>
            <button
                className='timeline-add-track'
                onClick={addTrack}
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '30px',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderBottom: '1px solid #333',
                    color: '#888',
                    cursor: 'pointer',
                    zIndex: 11,
                    flexShrink: 0,
                }}
            >
                Add track
            </button>
            
            {/* Track labels */}
            {Array.from({length: tracks}).map((_, trackIndex) => (
                <div
                    key={trackIndex}
                    style={{
                        height: `${trackHeight}px`,
                        width: '100%',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#888',
                        flexShrink: 0,
                    }}
                >
                    Track {trackIndex + 1}
                </div>
            ))}
        </div>
    );
}
