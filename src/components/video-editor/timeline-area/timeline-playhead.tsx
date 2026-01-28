import { useRef, useCallback } from "react";

interface PlayheadProps {
    currentTime: number;
    totalDuration: number;
    pixelsPerSecond: number;
    timelineWidth: number;
    onSeek: (time: number) => void;
}

export function Playhead({
    currentTime,
    totalDuration,
    pixelsPerSecond,
    timelineWidth,
    onSeek,
}: PlayheadProps) {
    const isDraggingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const playheadPosition = currentTime * pixelsPerSecond;

    const calculateTimeFromPosition = useCallback((clientX: number) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left + containerRef.current.scrollLeft;
        const time = Math.max(0, Math.min(x / pixelsPerSecond, totalDuration));
        return time;
    }, [pixelsPerSecond, totalDuration]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        const time = calculateTimeFromPosition(e.clientX);
        onSeek(time);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (isDraggingRef.current) {
                const time = calculateTimeFromPosition(moveEvent.clientX);
                onSeek(time);
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [calculateTimeFromPosition, onSeek]);

    return (
        <div
            ref={containerRef}
            className="playhead-container"
            style={{ width: `${timelineWidth}px` }}
            >
            {/* Playhead indicator */}
            <div
                className="playhead-indicator"
                style={{
                    left: `${playheadPosition}px`,
                }}
                >
                {/* Playhead handle (top triangle) */}
                <div 
                    className="playhead-handle" 
                    onMouseDown={handleMouseDown}
                />
                {/* Playhead line */}
                <div className="playhead-line" />
            </div>
        </div>
    );
}
