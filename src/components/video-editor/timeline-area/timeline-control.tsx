interface TimelineControlsProps {
    // Preview mode controls (optional - only shown in preview mode)
    previewControls?: React.ReactNode;
    numberOfTracks?: number;
}

export function TimelineControls({ previewControls, numberOfTracks }: TimelineControlsProps) {
    return (
        <div className="timeline-controls">
            {/* Preview mode controls (when in preview timeline overlay) */}
            {previewControls}
            <div className="h-[15%] flex items-center justify-center">Tracks</div>
            {
                Array.from({ length: numberOfTracks ?? 0 }).map((_, idx) => (
                    <div 
                        key={idx}
                        className="h-[50px] flex items-center justify-center border-solid border-top border-black"
                    >
                        Track {idx + 1}
                    </div>
                ))
            }
        </div>
    );
};