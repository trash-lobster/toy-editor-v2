interface Props {
    left: boolean,
    right: boolean,
    Header: React.ComponentType,
    Inspector: React.ComponentType,
    VideoEditor: React.ComponentType,
    EffectEditor: React.ComponentType,
}

export function Skeleton({
    left,
    right,
    Header,
    Inspector,
    VideoEditor,
    EffectEditor,
}: Props) {
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
                        <VideoEditor />
                    </div>

                    {/* Right Panel - Properties */}
                    {right && (
                        <div className="h-full border-l border-filmforge-border-light bg-white flex flex-col">
                            <EffectEditor />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}