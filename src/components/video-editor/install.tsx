import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlayback } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"

export function installVideoEditor() {
    const { VideoPreviewArea } = installVideoPreviewArea();
    const { VideoPlayback } = installVideoPlayback();

    const VideoEditor = () => {
        return (
            <InnerEditor VideoPreviewArea={VideoPreviewArea} VideoPlaybackPanel={VideoPlayback}/>
        )
    }

    return {
        VideoEditor,
    }
}