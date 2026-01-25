interface VideoEditorProps {
    VideoPreviewArea: React.ComponentType,
    TimelineArea: React.ComponentType,
    VideoPlaybackPanel: React.ComponentType,
}

export function VideoEditor({ 
    VideoPreviewArea, 
    VideoPlaybackPanel, 
    TimelineArea, 
}: VideoEditorProps) {
    return (
        <div
            className={`scene-editor-container`}
            tabIndex={0} // Make container focusable for keyboard events
            style={{ outline: 'none' }} // Remove focus outline
        >
            <VideoPreviewArea/>
            <VideoPlaybackPanel/>
            <TimelineArea/>
        </div>
    )
}