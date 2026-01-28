import { Upload } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import type { Node } from "../../canvas/state";

interface VideoPreviewProps {
    setCanvas: (canvas: HTMLCanvasElement | null) => void;
    resizeCanvas: (width: number, height: number, aspectRatio?: string) => void;
    nodes: readonly Node[];
    aspectRatio?: string;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => 
        Promise<{
            status: string;
        } | undefined>;
}

// we should switch whenever there are nodes added
export function VideoPreviewArea({
    setCanvas,
    resizeCanvas,
    handleFileUpload, 
    nodes,
    aspectRatio = '16:9'
}: VideoPreviewProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const canPlay = nodes && nodes.length > 0;

    // Handle canvas resize when container size changes
    const handleResize = useCallback(() => {
        if (!containerRef.current || !canvasRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
            resizeCanvas(width, height, aspectRatio);
        }
    }, [resizeCanvas, aspectRatio]);

    useEffect(() => {
        if (!canvasRef.current) return;
        // set the canvas whenever we can play clips
        setCanvas(canvasRef.current);
        // Initial resize
        handleResize();
    }, [setCanvas, canPlay, handleResize]);

    // ResizeObserver to handle container size changes
    useEffect(() => {
        if (!containerRef.current) return;
        
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        
        resizeObserver.observe(containerRef.current);
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [handleResize, canPlay]);

    if (canPlay) {
        return (
            <div className="video-preview-area" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'block',
                        margin: 'auto',
                    }}
                />
            </div>
        )
    }
    
    return (
        <div className="video-preview-area">
            <div className="text-center text-filmforge-text-light text-white">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, fileInputRef)}
                    className="hidden"
                    id="video-preview-upload"
                />
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-4">Add media to timeline to start editing</p>
                <label
                    htmlFor="video-preview-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 cursor-pointer transition-colors rounded-md font-medium"
                >
                    <Upload className="w-5 h-5" />
                    Upload Videos & Images
                </label>
                <p className="text-sm mt-4 opacity-60">Supports MP4, MOV, JPG, PNG</p>
            </div>
        </div>
    )
}