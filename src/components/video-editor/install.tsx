import type { CanvasState } from "../canvas/state";
import type { CanvasPresenter } from "../canvas/presenter";
import { VirtualTimelineState } from "./state";
import { installTimelineArea } from "./timeline-area/install";
import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlaybackPanel } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"
import { PlaybackEnginePresenter } from "./video-playback/engine/presenter";
import { createVideoElementPool } from "./video-playback/video-element-pool/state";
import { VideoElementPoolPresenter } from "./video-playback/video-element-pool/presenter";
import { createCanvasCompositor } from "./video-playback/canvas-compositor/state";
import { CanvasCompositorPresenter } from "./video-playback/canvas-compositor/presenter";

export function installVideoEditor(
    canvasState: CanvasState,
    canvasPresenter: CanvasPresenter,
    virtualTimelineState: VirtualTimelineState,
    addTrack: () => void,
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>
) {
    const videoPool = createVideoElementPool();
    const videoPoolPresenter = new VideoElementPoolPresenter(videoPool);
    const canvasCompositorPresenter = new CanvasCompositorPresenter(createCanvasCompositor(), videoPoolPresenter, canvasPresenter);
    const playbackEngine = new PlaybackEnginePresenter(
        virtualTimelineState,
        videoPoolPresenter,
        canvasCompositorPresenter,
        canvasPresenter,
    );

    const { VideoPreviewArea } = installVideoPreviewArea(handleFileUpload, canvasState);
    const { VideoPlaybackPanel } = installVideoPlaybackPanel(playbackEngine, virtualTimelineState);
    const { TimelineArea } = installTimelineArea(
        canvasState, 
        addTrack,
        canvasPresenter,
        virtualTimelineState,
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