import type { CanvasState } from "../canvas/state";
import type { CanvasPresenter } from "../canvas/presenter";
import { VirtualTimelineState } from "./state";
import { installTimelineArea } from "./timeline-area/install";
import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlaybackPanel } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"
import { PlaybackEngine } from "./video-playback/engine/presenter";
import { VideoElementPoolPresenter } from "./video-playback/video-element-pool/presenter";
import { createCanvasCompositor } from "./video-playback/canvas-compositor/state";
import { CanvasCompositor } from "./video-playback/canvas-compositor/presenter";

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
    const canvasCompositor = new CanvasCompositor(createCanvasCompositor(), videoPoolPresenter, canvasPresenter);
    const playbackEngine = new PlaybackEngine(
        virtualTimelineState,
        videoPoolPresenter,
        canvasCompositor,
        canvasPresenter,
    );

    const { VideoPreviewArea } = installVideoPreviewArea(
        handleFileUpload, 
        canvasState,
        canvasCompositor,
        playbackEngine,
    );
    const { VideoPlaybackPanel } = installVideoPlaybackPanel(playbackEngine, virtualTimelineState);
    const { TimelineArea } = installTimelineArea(
        canvasState, 
        addTrack,
        canvasPresenter,
        virtualTimelineState,
        playbackEngine,
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