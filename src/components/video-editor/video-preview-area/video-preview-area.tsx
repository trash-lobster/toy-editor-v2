import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Node } from "../../canvas/state";

interface VideoPreviewProps {
    setCanvas: (canvas: HTMLCanvasElement | null) => void;
    seek: (currentTime: number) => void;
    nodes: readonly Node[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => 
        Promise<{
            status: string;
        } | undefined>;
}

// we should switch whenever there are nodes added
export function VideoPreviewArea({
    setCanvas,
    seek,
    handleFileUpload, 
    nodes
}: VideoPreviewProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canPlay = nodes && nodes.length > 0;

    useEffect(() => {
        if (!canvasRef.current) return;
        // set the canvas whenever we can play clips
        setCanvas(canvasRef.current);
        // seek(0);
    }, [canvasRef, setCanvas, seek, canPlay]);

    if (canPlay) {
        return (
            <div className="video-preview-area">
                <canvas
                    ref={canvasRef}
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