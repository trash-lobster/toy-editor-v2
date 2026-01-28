import type { CanvasState } from "../canvas/state";
import type { CanvasPresenter } from "../canvas/presenter";
import { VirtualTimelineState } from "./state";
import { installTimelineArea } from "./timeline-area/install";
import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlaybackPanel } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"
import { PlaybackController } from "./video-playback/engine/presenter";
import { VideoElementPoolPresenter } from "./video-playback/video-element-pool/presenter";
import { createCanvasCompositor } from "./video-playback/canvas-compositor/state";
import { VideoCompositor } from "./video-playback/canvas-compositor/presenter";

export function installVideoEditor(
    canvasState: CanvasState,
    canvasPresenter: CanvasPresenter,
    videoPoolPresenter: VideoElementPoolPresenter,
    virtualTimelineState: VirtualTimelineState,
    addTrack: () => void,
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>
) {
    const videoCompositor = new VideoCompositor(createCanvasCompositor(), videoPoolPresenter, canvasPresenter);
    const playbackController = new PlaybackController(
        virtualTimelineState,
        videoPoolPresenter,
        videoCompositor,
        canvasPresenter,
    );

    const { VideoPreviewArea } = installVideoPreviewArea(
        handleFileUpload, 
        canvasState,
        videoCompositor,
    );
    const { VideoPlaybackPanel } = installVideoPlaybackPanel(playbackController, virtualTimelineState);
    const { TimelineArea } = installTimelineArea(
        canvasState, 
        addTrack,
        canvasPresenter,
        virtualTimelineState,
        playbackController,
    );


    const VideoEditor = () => {
        return (
            <InnerEditor 
                VideoPreviewArea={VideoPreviewArea} 
                VideoPlaybackPanel={VideoPlaybackPanel}
                TimelineArea={TimelineArea}
            />
        )
    }

    return {
        VideoEditor,
        virtualTimelineState,
    }
}