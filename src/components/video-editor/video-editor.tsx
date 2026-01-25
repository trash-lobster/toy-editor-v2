interface VideoEditorProps {
    VideoPreviewArea: React.ComponentType,
    // TimelineArea: React.ComponentType,
    VideoPlaybackPanel: React.ComponentType,
}

export function VideoEditor({ 
    VideoPreviewArea, 
    VideoPlaybackPanel, 
    // TimelineArea, 
}: VideoEditorProps) {
    return (
        <div
            className={`scene-editor-container`}
            tabIndex={0} // Make container focusable for keyboard events
            style={{ outline: 'none' }} // Remove focus outline
        >
            <VideoPreviewArea/>
            <VideoPlaybackPanel/>
            {/* {virtualTimelineManager && (
                <VideoPlaybackPanel
                    virtualTimeline={virtualTimelineManager}
                    onTogglePlayback={() => virtualTimelineManager.setPlaying(!virtualTimelineManager.isPlaying())}
                    onSkipPrevious={() => {
                        const currentClip = virtualTimelineManager.getCurrentClip();
                        if (currentClip) {
                            if (currentClip.clipTime > 2) {
                                virtualTimelineManager.setCurrentTime(currentClip.clipStartTime);
                            } else {
                                const prevTime = Math.max(0, currentClip.clipStartTime - 0.1);
                                virtualTimelineManager.setCurrentTime(prevTime);
                            }
                        }
                    }}
                    onSkipNext={() => {
                        const currentClip = virtualTimelineManager.getCurrentClip();
                        if (currentClip) {
                            const nextTime = currentClip.clipEndTime;
                            virtualTimelineManager.setCurrentTime(nextTime);
                        }
                    }}
                />
            )} */}
            {/* <TimelineArea/> */}
        </div>
    )
}