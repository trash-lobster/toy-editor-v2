import { useSnapshot } from "valtio/react";
import { Inspector as InternalInspector } from "./inspector";
import { createInspectorState, type InspectorTab } from "./state";


export function installInspector() {
    const inspectorState = createInspectorState();
    const setTab = (tab: InspectorTab) => inspectorState.currentTab = tab;

    const Inspector = () => {
        const { currentTab } = useSnapshot(inspectorState);
        
        return (
            <InternalInspector currentTab={currentTab} setTab={setTab}/>
        );
    };
    
    return {
        Inspector,
    };
}
