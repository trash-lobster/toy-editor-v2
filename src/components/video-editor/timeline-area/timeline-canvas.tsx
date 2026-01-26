import { useRef, useMemo } from "react";
import type { Node, SceneEditorCell } from "../../canvas/state";
import { TimelineRuler } from "./ruler";
import { TimelineContent } from "./timeline-content";

export type ReadonlyMediaTrack = {
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

    const nodeMap = useMemo(() => {
        const map = new Map<string, Node>();
        nodes.forEach(node => map.set(node.id, node));
        return map;
    }, [nodes]);

    return (
        <div className={`timeline-canvas`}>
            <div>
                <TimelineRuler 
                    width={timelineWidth} 
                    pixelsPerSecond={pixelsPerSecond} 
                    totalDuration={totalDuration}
                />
                <div ref={timelineRef} className='relative flex flex-col z-[1] min-w-full'
                    style={{ width: `${timelineWidth}px` }}
                >
                    {tracks.map((track: ReadonlyMediaTrack) => (
                        <TimelineContent
                            nodeMap={nodeMap}
                            pixelsPerSecond={pixelsPerSecond}
                            trackHeight={trackHeight}
                            isDragging={isDragging}
                            dragPreviewOffset={dragPreviewOffset}
                            originalTrackId={originalTrackId}
                            currentDragTrackId={currentDragTrackId}
                            handleDragStart={handleDragStart} 
                            handleClipSelect={handleClipSelect}
                            selectedClipId={selectedClipId}
                            track={track}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
