import { useRef, useMemo } from "react";
import type { MediaTrack, Node } from "../../canvas/state";
import { TimelineClip } from "./timeline-clip";

interface TimelineCanvasProps {
    handleClipSelect: (cellId: string, trackId: number, onClipSelect?: (cellId: string, trackId: number) => void) => void,
    handleDragStart: (event: React.MouseEvent, startTime: number, cellId: string, pixelsPerSecond: number) => void,
    tracks: MediaTrack[] | undefined,
    totalDuration: number,
    selectedClipId: string | null,
    nodes: Node[],
    // canvasState: CanvasState;
    // onClipSelect?: (cellId: string, trackId: number) => void;
    // onClipMove?: (cellId: string, newStartTime: number, trackId: number) => void;
}

export function TimelineCanvas({
    handleClipSelect,
    handleDragStart,
    tracks = [],
    totalDuration = 30,
    nodes,
    selectedClipId,
}: TimelineCanvasProps) {
    const timelineRef = useRef<HTMLDivElement>(null);

    const pixelsPerSecond = 20;
    const trackHeight = 80;

    const timelineWidth = Math.max(totalDuration * pixelsPerSecond, 1000);

    const nodeMap = useMemo(() => {
        const map = new Map();
        nodes.forEach(node => map.set(node.id, node));
        return map;
    }, [nodes]);

    const timeMarkers = useMemo(() => {
        const markers = [];
        const interval = 1;
        
        for (let t = 0; t <= totalDuration; t += interval) {
            markers.push(t);
        }
        return markers;
    }, [totalDuration]);

    return (
        <div className={`timeline-canvas`}>
            <div 
                className="timeline-canvas-container" 
                style={{ width: '100%', height: '100%', overflow: 'auto', }}
            >
                {/* Time Ruler */}
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        height: '30px',
                        borderBottom: '1px solid #333',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}
                >
                    <div style={{ position: 'relative', width: `${timelineWidth}px`, height: '100%' }}>
                        {timeMarkers.map((time) => (
                            <div
                                key={time}
                                style={{
                                    position: 'absolute',
                                    left: `${time * pixelsPerSecond}px`,
                                    height: '100%',
                                    borderLeft: '1px solid #444',
                                    paddingLeft: '4px',
                                    fontSize: '11px',
                                    color: '#888',
                                    paddingTop: '4px',
                                }}
                            >
                                {time}s
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Content */}
                <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'column' }}>
                    {tracks.map((track: MediaTrack) => (
                        <div
                            key={track.id}
                            className="timeline-track"
                            style={{
                                display: 'flex',
                                height: `${trackHeight}px`,
                                borderBottom: '1px solid #333',
                                position: 'relative',
                            }}
                        >
                            {/* Track Content */}
                            <div
                                style={{
                                    position: 'relative',
                                    width: `${timelineWidth}px`,
                                    height: '100%',
                                }}
                            >
                                {track.cells.map((cell) => {
                                    const node = nodeMap.get(cell.mediaNodeId);
                                    if (!node) return null;

                                    return (
                                        <TimelineClip
                                            key={cell.id}
                                            cell={cell}
                                            node={node}
                                            pixelsPerSecond={pixelsPerSecond}
                                            trackHeight={trackHeight}
                                            isSelected={selectedClipId === cell.id}
                                            onSelect={(cellId) => handleClipSelect(cellId, track.id)}
                                            onDragStart={(cellId, event) => handleDragStart(event, cell.startTime || 0, cellId, pixelsPerSecond)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
