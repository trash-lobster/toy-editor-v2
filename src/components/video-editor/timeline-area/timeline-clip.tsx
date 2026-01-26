import { useMemo } from "react";
import type { SceneEditorCell, MediaNode } from "../../canvas/state";

interface TimelineClipProps {
    cell: SceneEditorCell;
    node: MediaNode;
    pixelsPerSecond: number;
    trackHeight: number;
    trackId: number;
    isSelected?: boolean;
    isDragging?: boolean;
    dragPreviewOffset?: number;
    originalTrackId?: number;
    currentDragTrackId?: number;
    onSelect?: (cellId: string) => void;
    onDragStart?: (cellId: string, trackId: number, event: React.MouseEvent) => void;
}

export function TimelineClip({
    cell,
    node,
    pixelsPerSecond = 20,
    trackHeight,
    trackId,
    isSelected = false,
    isDragging = false,
    dragPreviewOffset = 0,
    originalTrackId = 0,
    currentDragTrackId = 0,
    onSelect,
    onDragStart,
}: TimelineClipProps) {
    const effectiveDuration = useMemo(() => {
        const duration = cell.duration || 0;
        const trimStart = cell.trimStart || 0;
        const trimEnd = cell.trimEnd || 0;
        return Math.max(0.1, duration - trimStart - trimEnd);
    }, [cell.duration, cell.trimStart, cell.trimEnd]);

    const clipWidth = effectiveDuration * pixelsPerSecond;
    const clipLeft = (cell.startTime || 0) * pixelsPerSecond;

    // Calculate vertical offset for track changes
    const verticalOffset = (currentDragTrackId - originalTrackId) * trackHeight;

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(cell.id);
        }
        if (onDragStart) {
            onDragStart(cell.id, trackId, e);
        }
    };

    return (
        <div
            className={`timeline-clip ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                top: '4px',
                borderRadius: '4px',
                overflow: 'hidden',
                userSelect: 'none',
                boxSizing: 'border-box',
                left: `${clipLeft}px`,
                width: `${clipWidth}px`,
                height: `${trackHeight - 8}px`,
                backgroundColor: node.type === 'video' ? '#4a90e2' : '#e24a90',
                border: isSelected ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: isDragging ? `translate(${dragPreviewOffset}px, ${verticalOffset}px)` : 'none',
                opacity: isDragging ? 0.7 : 1,
                zIndex: isDragging ? 100 : 1,
                transition: isDragging ? 'none' : 'opacity 0.2s',
            }}
            onMouseDown={handleMouseDown}
        >
            <div
                style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {node.label}
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '4px',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.7)',
                }}
            >
                {effectiveDuration.toFixed(1)}s
            </div>
        </div>
    );
}
