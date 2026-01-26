import { useMemo } from "react";

interface RulerProps {
    width: number,
    pixelsPerSecond: number,
    totalDuration: number,
}

export function TimelineRuler({width, pixelsPerSecond, totalDuration} : RulerProps) {
    const timeMarkers = useMemo(() => {
        const markers = [];
        const interval = 10;
        
        for (let t = 0; t <= totalDuration; t += interval) {
            markers.push(t);
        }
        return markers;
    }, [totalDuration]);

    return (
        <div
            className="timeline-ruler"
            style={{ width: `${width}px` }}
        >
            <div className='relative w-full h-full'>
                {timeMarkers.map((time) => (
                    <div
                        key={time}
                        className='absolute h-full pt-[4px] pl-[4px] ml-[10px] text-[11px]'
                        style={{
                            left: `${time * pixelsPerSecond}px`,
                            color: '#888',
                            borderLeft: '1px solid #888',
                        }}
                    >
                        {time}s
                    </div>
                ))}
            </div>
        </div>
    )
}