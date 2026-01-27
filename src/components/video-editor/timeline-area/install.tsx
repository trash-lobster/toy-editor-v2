import { useSnapshot } from "valtio/react";
import { TimelineCanvas as InternalTimelineCanvas } from "./timeline-canvas";
import { TimelineControls } from "./timeline-controls";
import { createTimelineState } from "./state";
import type { CanvasState } from "../../canvas/state";
import { TimelinePresenter } from "./presenter";
import type { CanvasPresenter } from "../../canvas/presenter";
import type { VirtualTimelineState } from "../state";


export function installTimelineArea(
    canvasState: CanvasState,
    addTrack: () => void,
    canvasPresenter: CanvasPresenter,
    virtualTimelineState: VirtualTimelineState,
) {
    const timelineState = createTimelineState();
    const presenter = new TimelinePresenter(timelineState);
    presenter.setCanvasPresenter(canvasPresenter);
    
    const TimelineArea = () => {
        const { selectedClipId, isDragging, dragPreviewOffset, originalTrackId, currentDragTrackId } = useSnapshot(timelineState);
        const { totalDuration } = useSnapshot(virtualTimelineState);
        const { nodes, sceneEditor } = useSnapshot(canvasState);

        return (
            <div className='timeline-area' style={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                {/* create inner container that can be scrolled across */}
                <div style={{display: 'flex', overflow: 'auto', width: '100%', minHeight: '100%'}}>
                    <TimelineControls 
                        tracks={sceneEditor?.tracks.length} 
                        trackHeight={80}
                        addTrack={addTrack}
                        setAsCurrentTrack={canvasPresenter.setCurrentTrack}
                        currentTrack={sceneEditor?.currentTrack ?? 0}
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
            </div>
        )
    }
    
    return {
        TimelineArea,
    };
}
