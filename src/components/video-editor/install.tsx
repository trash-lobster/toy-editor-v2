import { VideoEditor as InnerEditor } from "./video-editor"
import { installVideoPlayback } from "./video-playback/install";
import { installVideoPreviewArea } from "./video-preview-area/install"

export function installVideoEditor(   
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>) {
    const { VideoPreviewArea } = installVideoPreviewArea(handleFileUpload);
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