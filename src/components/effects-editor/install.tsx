import { useSnapshot } from "valtio";
import { EffectEditor as InternalEditor } from "./effects-editor";
import type { CanvasState } from "../canvas/state";
import type { CanvasPresenter } from "../canvas/presenter";

export function installEffectsEditor(
    canvasState: CanvasState, 
    canvasPresenter: CanvasPresenter
) {
    const EffectEditor = () => {
        const { sceneEditor } = useSnapshot(canvasState);
        
        const currentTrackIdx = sceneEditor?.currentTrack ?? 0;
        const currentTrack = sceneEditor?.tracks[currentTrackIdx];
        const effects = currentTrack?.effects ?? {};

        return (
            <InternalEditor
                opacity={effects.opacity ?? 1}
                brightness={effects.brightness ?? 1}
                contrast={effects.contrast ?? 1}
                saturation={effects.saturation ?? 1}
                setOpacity={canvasPresenter.setOpacity} 
                setBrightness={canvasPresenter.setBrightness} 
                setContrast={canvasPresenter.setContrast} 
                setSaturation={canvasPresenter.setSaturation}
            />
        );
    };
    
    return {
        EffectEditor,
    };
}
