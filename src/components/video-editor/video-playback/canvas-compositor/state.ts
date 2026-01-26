export class CanvasCompositorState {
    canvasRef: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
}

export function createCanvasCompositor() {
    return new CanvasCompositorState();
}