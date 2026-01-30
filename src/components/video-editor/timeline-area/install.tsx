import { useSnapshot } from "valtio/react";
import { TimelineCanvas as InternalTimelineCanvas } from "./timeline-canvas";
import { TimelineControls } from "./timeline-controls";
import { createTimelineState } from "./state";
import type { CanvasState } from "../../canvas/state";
import { TimelinePresenter } from "./presenter";
import type { CanvasPresenter } from "../../canvas/presenter";
import type { VirtualTimelineState } from "../state";
import type { PlaybackController } from "../video-playback/engine/presenter";


export function installTimelineArea(
    canvasState: CanvasState,
    addTrack: () => void,
    canvasPresenter: CanvasPresenter,
    virtualTimelineState: VirtualTimelineState,
    playbackController: PlaybackController,
) {
    const timelineState = createTimelineState();
    const presenter = new TimelinePresenter(timelineState, canvasPresenter, playbackController);
    
    const TimelineArea = () => {
        const { selectedClipId, isDragging, dragPreviewOffset, originalTrackId, currentDragTrackId } = useSnapshot(timelineState);
        const { totalDuration, currentTime } = useSnapshot(virtualTimelineState);
        const { nodes, sceneEditor } = useSnapshot(canvasState);

        return (
            <div className='timeline-area' style={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                {/* create inner container that can be scrolled across */}
                <div style={{display: 'flex', overflow: 'auto', width: '100%', height: '100%'}}>
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
                        currentTime={currentTime}
                        onSeek={playbackController.seek}
                    />
                </div>
            </div>
        )
    }
    
    return {
        TimelineArea,
    };
}
