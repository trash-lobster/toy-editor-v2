import { useSnapshot } from "valtio/react";
import { Inspector as InternalInspector } from "./inspector";
import { createInspectorState, type InspectorTab } from "./state";


export function installInspector(handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => Promise<{
    status: string;
} | undefined>) {
    const inspectorState = createInspectorState();
    const setTab = (tab: InspectorTab) => inspectorState.currentTab = tab;
    
    const Inspector = () => {
        const { currentTab } = useSnapshot(inspectorState);
        
        return (
            <InternalInspector currentTab={currentTab} setTab={setTab} handleFileUpload={handleFileUpload}/>
        );
    };
    
    return {
        Inspector,
    };
}
