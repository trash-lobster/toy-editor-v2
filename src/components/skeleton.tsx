import { useSnapshot } from "valtio/react";
import { installHeader } from "./header/install";
import { createLayoutState } from "./state";
import { installInspector } from "./inspector/install";

// Create state outside component so it persists across renders
const layoutState = createLayoutState();

const layoutPresenter = {
    toggleLeft: () => layoutState.left = !layoutState.left,
    toggleRight: () => layoutState.right = !layoutState.right

}

export function Skeleton() {
    const { Header } = installHeader(layoutPresenter.toggleLeft, layoutPresenter.toggleRight);
    const { Inspector } = installInspector();

    const { left, right } = useSnapshot(layoutState);

    const getGridColumns = () => {
        if (left && right) {
            return 'clamp(14rem, 15%, 16rem) 1fr clamp(14rem, 15%, 16rem)';
        } else if (left && !right) {
            return 'clamp(14rem, 15%, 16rem) 1fr';
        } else if (!left && right) {
            return '1fr clamp(14rem, 15%, 16rem)';
        } else {
            return '1fr';
        }
    };
    
    return (
        <div className="h-screen w-full overflow-hidden relative flex flex-col">
            {/* Top Header */}
            <Header />

            {/* Main Content Area */}
            <div className="flex-1 flex">
                {/* Dynamic Layout based on panel visibility */}
                <div className="grid h-full w-full" style={{ gridTemplateColumns: getGridColumns() }}>
                    {/* Left Panel - SceneEditor Inspector */}
                    {left && (
                        <div className="h-full border-r border-filmforge-border-light bg-white flex flex-col">
                            <Inspector />
                        </div>
                    )}

                    {/* SceneEditor Area - Center - Always present */}
                    <div className="h-full bg-filmforge-background overflow-hidden">
                        {/* {children} */}
                    </div>

                    {/* Right Panel - Properties */}
                    {right && (
                        <div className="h-full border-l border-filmforge-border-light bg-white flex flex-col">
                            {/* <Editor /> */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}