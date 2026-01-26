import { useSnapshot } from "valtio/react";
import { TimelineCanvas as InternalTimelineCanvas } from "./timeline-canvas";
import { TimelineControls } from "./timeline-controls";
import { createTimelineState } from "./state";
import type { CanvasState } from "../../canvas/state";
import { TimelinePresenter } from "./presenter";
import type { VirtualTimelineState } from "../state";
import type { CanvasPresenter } from "../../canvas/presenter";


export function installTimelineArea(
    canvasState: CanvasState, 
    virtualTimelineState: VirtualTimelineState, 
    addTrack: () => void,
    canvasPresenter: CanvasPresenter
) {
    const timelineState = createTimelineState();
    const presenter = new TimelinePresenter(timelineState);
    presenter.setCanvasPresenter(canvasPresenter);
    
    const TimelineArea = () => {
        const { selectedClipId, isDragging, dragPreviewOffset, originalTrackId, currentDragTrackId } = useSnapshot(timelineState);
        const { nodes, sceneEditor } = useSnapshot(canvasState);
        const { totalDuration } = useSnapshot(virtualTimelineState);

        return (
            <div className='timeline-area' style={{ display: 'flex', overflow: 'auto', height: '100%' }}>
                <TimelineControls 
                    tracks={sceneEditor?.tracks.length} 
                    trackHeight={80}
                    addTrack={addTrack}
                />
                <InternalTimelineCanvas
                    handleClipSelect={presenter.handleClipSelect}
                    handleDragStart={presenter.handleDragStart}
                    totalDuration={totalDuration}
                    selectedClipId={selectedClipId}
                    isDragging={isDragging}
                    dragPreviewOffset={dragPreviewOffset}
                    originalTrackId={originalTrackId}
                    currentDragTrackId={currentDragTrackId}
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
