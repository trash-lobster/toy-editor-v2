import { useSnapshot } from "valtio/react";
import { TimelineCanvas as InternalTimelineCanvas } from "./timeline-canvas";
import { createTimelineState } from "./state";
import type { CanvasState } from "../../canvas/state";
import { TimelinePresenter } from "./presenter";
import type { VirtualTimelineState } from "../state";


export function installTimelineArea(canvasState: CanvasState, virtualTimelineState: VirtualTimelineState) {
    const timelineState = createTimelineState();
    const presenter = new TimelinePresenter(timelineState);
    
    const TimelineArea = () => {
        const { selectedClipId } = useSnapshot(timelineState);
        const { nodes, sceneEditor } = useSnapshot(canvasState);
        const { totalDuration } = useSnapshot(virtualTimelineState);

        return (
            <div className='timeline-area'>
                <div className="timeline-controls"></div>
                <InternalTimelineCanvas
                    handleClipSelect={presenter.handleClipSelect}
                    handleDragStart={presenter.handleDragStart}
                    totalDuration={totalDuration}
                    selectedClipId={selectedClipId}
                    nodes={nodes}
                    tracks={sceneEditor?.tracks}
                />
            </div>
        )
    }
    
    return {
        TimelineArea,
    };
}
