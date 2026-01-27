import { VideoPreviewArea as InternalVideoPreviewArea } from "./video-preview-area";
import type { CanvasState } from "../../canvas/state";
import { useSnapshot } from "valtio";
import type { CanvasCompositor } from "../video-playback/canvas-compositor/presenter";
import type { PlaybackEngine } from "../video-playback/engine/presenter";

export function installVideoPreviewArea(
    handleFileUpload: (
        e: React.ChangeEvent<HTMLInputElement>, 
        fileInputRef: React.RefObject<HTMLInputElement | null>
    ) => Promise<{status: string} | undefined>,
    canvasState: CanvasState,
    compositor: CanvasCompositor,
    engine: PlaybackEngine,
) {
    const VideoPreviewArea = () => {
        const { nodes, sceneEditor } = useSnapshot(canvasState);
        
        return (
            <InternalVideoPreviewArea 
                handleFileUpload={handleFileUpload}
                nodes={nodes}
                setCanvas={compositor.setCanvas}
                resizeCanvas={compositor.resizeCanvas}
                seek={engine.seek}
                aspectRatio={sceneEditor?.aspectRatio}
            />
        );
    };
    
    return {
        VideoPreviewArea,
    };
}
