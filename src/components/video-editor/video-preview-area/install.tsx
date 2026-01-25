// import { useSnapshot } from "valtio/react";
import { VideoPreviewArea as InternalVideoPreviewArea } from "./video-preview-area";
import { createVideoPlayerState } from "./state";
import type { SceneEditorCell } from "../../canvas/state";

export function installVideoPreviewArea(
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>
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
        
        return (
            <InternalVideoPreviewArea 
                handleFileUpload={handleFileUpload}
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
