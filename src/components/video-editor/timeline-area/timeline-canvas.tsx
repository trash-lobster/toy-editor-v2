import { useRef, useMemo } from "react";
import type { Node, SceneEditorCell } from "../../canvas/state";
import { TimelineClip } from "./timeline-clip";

type ReadonlyMediaTrack = {
    readonly id: number;
    readonly cells: readonly SceneEditorCell[];
};

interface TimelineCanvasProps {
    handleClipSelect: (cellId: string, trackId: number, onClipSelect?: (cellId: string, trackId: number) => void) => void,
    handleDragStart: (event: React.MouseEvent, startTime: number, cellId: string, trackId: number, duration: number, pixelsPerSecond: number, trackHeight: number) => void,
    tracks: readonly ReadonlyMediaTrack[] | undefined,
    totalDuration: number,
    selectedClipId: string | null,
    isDragging: boolean,
    dragPreviewOffset: number,
    originalTrackId: number,
    currentDragTrackId: number,
    nodes: readonly Node[],
}

export function TimelineCanvas({
    handleClipSelect,
    handleDragStart,
    tracks = [],
    totalDuration = 30,
    nodes,
    selectedClipId,
    isDragging,
    dragPreviewOffset,
    originalTrackId,
    currentDragTrackId,
}: TimelineCanvasProps) {
    const timelineRef = useRef<HTMLDivElement>(null);

    const pixelsPerSecond = 20;
    const trackHeight = 80;

    const timelineWidth = Math.max(Math.ceil(totalDuration) * pixelsPerSecond, 1000);

    console.log('Timeline width:', timelineWidth);

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
            <div>
                {/* Time Ruler */}
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        height: '30px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        alignItems: 'flex-end',
                        backgroundColor: 'white',
                        zIndex: 2,
                        minWidth: '100%',
                        width: `${timelineWidth}px`
                    }}
                >
                    <div style={{ 
                        position: 'relative', 
                        width: '100%',
                        height: '100%'
                    }}>
                        {timeMarkers.map((time) => {
                            if (time % 10 !== 0) return <></>
                            return <div
                                key={time}
                                style={{
                                    position: 'absolute',
                                    left: `${time * pixelsPerSecond}px`,
                                    height: '100%',
                                    marginLeft: '10px',
                                    fontSize: '11px',
                                    color: '#888',
                                    paddingTop: '4px',
                                    paddingLeft: '4px',
                                    borderLeft: '1px solid #888',
                                }}
                            >
                                {time}s
                            </div>
                        })}
                    </div>
                </div>

                {/* Timeline Content */}
                <div ref={timelineRef} 
                    style={{
                        position: 'relative',
                        display: 'flex', 
                        flexDirection: 'column',
                        zIndex: 1,
                        minWidth: '100%',
                        width: `${timelineWidth}px`,
                    }}
                >
                    {tracks.map((track: ReadonlyMediaTrack) => (
                        <div
                            key={track.id}
                            className="timeline-track"
                            style={{
                                display: 'flex',
                                minHeight: `${trackHeight}px`,
                                borderBottom: '1px solid #333',
                                position: 'relative',
                                paddingLeft: '10px',
                            }}
                        >
                            {/* Track Content */}
                            <div
                                style={{
                                    position: 'relative',
                                    minWidth: `${100}px`,
                                    // height: '100%',
                                }}
                            >
                                {track.cells.map((cell) => {
                                    const node = nodeMap.get(cell.mediaNodeId);
                                    if (!node) return null;

                                    const effectiveDuration = (() => {
                                        const duration = cell.duration || 0;
                                        const trimStart = cell.trimStart || 0;
                                        const trimEnd = cell.trimEnd || 0;
                                        return Math.max(0.1, duration - trimStart - trimEnd);
                                    })();

                                    const isBeingDragged = isDragging && selectedClipId === cell.id;

                                    return (
                                        <TimelineClip
                                            key={cell.id}
                                            cell={cell}
                                            node={node}
                                            pixelsPerSecond={pixelsPerSecond}
                                            trackHeight={trackHeight}
                                            trackId={track.id}
                                            isSelected={selectedClipId === cell.id}
                                            isDragging={isBeingDragged}
                                            dragPreviewOffset={isBeingDragged ? dragPreviewOffset : 0}
                                            originalTrackId={isBeingDragged ? originalTrackId : track.id}
                                            currentDragTrackId={isBeingDragged ? currentDragTrackId : track.id}
                                            onSelect={(cellId) => handleClipSelect(cellId, track.id)}
                                            onDragStart={(cellId, trackId, event) => 
                                                handleDragStart(event, cell.startTime || 0, cellId, trackId, effectiveDuration, pixelsPerSecond, trackHeight)
                                            }
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
