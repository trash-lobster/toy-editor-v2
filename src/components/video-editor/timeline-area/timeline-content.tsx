import type { ReadonlyMediaTrack } from "./timeline-canvas";
import type { Node } from "../../canvas/state";
import { TimelineClip } from "./timeline-clip";
import { getEffectiveDuration } from "../../../lib/util";

interface Props {
    nodeMap: Map<string, Node>,
    handleClipSelect: (cellId: string, trackId: number, onClipSelect?: (cellId: string, trackId: number) => void) => void,
    handleDragStart: (event: React.MouseEvent, startTime: number, cellId: string, trackId: number, duration: number, pixelsPerSecond: number, trackHeight: number) => void,
    handleTrimStart: (event: React.MouseEvent, side: 'left' | 'right', cellId: string, trackId: number, pixelsPerSecond: number) => void,
    selectedClipId: string | null,
    isDragging: boolean,
    dragPreviewOffset: number,
    originalTrackId: number,
    currentDragTrackId: number,
    pixelsPerSecond: number,
    trackHeight: number,
    track: ReadonlyMediaTrack,
}

export function TimelineContent({ 
    track, 
    nodeMap,
    handleClipSelect,
    handleDragStart,
    handleTrimStart,
    isDragging,
    selectedClipId,
    pixelsPerSecond,
    trackHeight,
    dragPreviewOffset,
    originalTrackId,
    currentDragTrackId,
} : Props) {
    return (
        <div
            key={track.id}
            className="timeline-track flex relative pl-[10px]"
            style={{
                minHeight: `${trackHeight}px`,
                borderBottom: '1px solid #333',
            }}
        >
            <div className='relative min-w-full'>
                {track.cells.map((cell) => {
                    const node = nodeMap.get(cell.mediaNodeId);
                    if (!node) return null;

                    const effectiveDuration = getEffectiveDuration(cell);
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
                            onTrimStartLeft={(cellId, trackId, e) => handleTrimStart(e, 'left', cellId, track.id, pixelsPerSecond)}
                            onTrimStartRight={(cellId, trackId, e) => handleTrimStart(e, 'right', cellId, track.id, pixelsPerSecond)}
                        />
                    );
                })}
            </div>
        </div>
    )
}