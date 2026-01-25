import { useMemo } from "react";
import type { SceneEditorCell, MediaNode } from "../../canvas/state";

interface TimelineClipProps {
    cell: SceneEditorCell;
    node: MediaNode;
    pixelsPerSecond: number;
    trackHeight: number;
    isSelected?: boolean;
    onSelect?: (cellId: string) => void;
    onDragStart?: (cellId: string, event: React.MouseEvent) => void;
}

export function TimelineClip({
    cell,
    node,
    pixelsPerSecond = 20,
    trackHeight,
    isSelected = false,
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(cell.id);
        }
        if (onDragStart) {
            onDragStart(cell.id, e);
        }
    };

    return (
        <div
            className={`timeline-clip ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left: `${clipLeft}px`,
                width: `${clipWidth}px`,
                height: `${trackHeight - 8}px`,
                top: '4px',
                backgroundColor: node.type === 'video' ? '#4a90e2' : '#e24a90',
                border: isSelected ? '2px solid #fff' : '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                cursor: 'grab',
                overflow: 'hidden',
                userSelect: 'none',
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
