import { VideoPreviewArea as InternalVideoPreviewArea } from "./video-preview-area";
import type { CanvasState } from "../../canvas/state";
import { useSnapshot } from "valtio";
import type { VideoCompositor } from "../video-playback/canvas-compositor/presenter";

export function installVideoPreviewArea(
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>,
    canvasState: CanvasState,
    compositor: VideoCompositor,
) {
    const VideoPreviewArea = () => {
        const { nodes, sceneEditor } = useSnapshot(canvasState);
        
        return (
            <InternalVideoPreviewArea 
                handleFileUpload={handleFileUpload}
                nodes={nodes}
                setCanvas={compositor.setCanvas}
                resizeCanvas={compositor.resizeCanvas}
                aspectRatio={sceneEditor?.aspectRatio}
            />
        );
    };
    
    return {
        VideoPreviewArea,
    };
}
