import { VideoPreviewArea as InternalVideoPreviewArea } from "./video-preview-area";
import { createVideoPlayerState } from "./state";
import type { SceneEditorCell, CanvasState } from "../../canvas/state";
import type { CanvasPresenter } from "../../canvas/presenter";
import { useSnapshot } from "valtio";

export function installVideoPreviewArea(
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>,
    canvasPresenter: CanvasPresenter,
    canvasState: CanvasState,
) {
    const videoPlayerState = createVideoPlayerState();
    
    const setCurrentClip = (clip: SceneEditorCell | null) => {
        videoPlayerState.currentClip = clip;
    };
    
    const setSeekTime = (time: number) => {
        videoPlayerState.seekTime = time;
    };
    
    const setMediaUrl = (url: string | undefined) => {
        videoPlayerState.mediaUrl = url;
    };

    const VideoPreviewArea = () => {
        // const { currentClip, seekTime, mediaUrl } = useSnapshot(videoPlayerState);
        const { nodes } = useSnapshot(canvasState);
        
        return (
            <InternalVideoPreviewArea 
                handleFileUpload={handleFileUpload}
                nodes={nodes}
                // currentClip={currentClip}
                // seekTime={seekTime}
                // mediaUrl={mediaUrl}
                // setCurrentClip={setCurrentClip}
                // setSeekTime={setSeekTime}
                // setMediaUrl={setMediaUrl}
            />
        );
    };
    
    return {
        VideoPreviewArea,
        setCurrentClip,
        setSeekTime,
        setMediaUrl,
    };
}
