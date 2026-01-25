import type { CanvasState } from "../canvas/state";
import { createVirtualTimelineState } from "./state";
import { installTimelineArea } from "./timeline-area/install";
import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlayback } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"

export function installVideoEditor(
    canvasState: CanvasState,
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>
) {
    const virtualTimelineState = createVirtualTimelineState();
    const { VideoPreviewArea } = installVideoPreviewArea(handleFileUpload);
    const { VideoPlayback } = installVideoPlayback();
    const { TimelineArea } = installTimelineArea(canvasState, virtualTimelineState);

    const VideoEditor = () => {
        return (
            <InnerEditor 
                VideoPreviewArea={VideoPreviewArea} 
                VideoPlaybackPanel={VideoPlayback}
                TimelineArea={TimelineArea}
            />
        )
    }

    return {
        VideoEditor,
        virtualTimelineState,
    }
}