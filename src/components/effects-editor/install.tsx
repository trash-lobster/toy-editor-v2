import { EffectEditor as InternalEditor } from "./effects-editor";

export function installEffectsEditor() {

    const EffectEditor = () => {    
        return (
            <InternalEditor/>
        );
    };
    
    return {
        EffectEditor,
    };
}
