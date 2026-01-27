export class CanvasCompositorState {
    canvasRef: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    offscreenCanvas: OffscreenCanvas | null = null;
    offScnCtx: OffscreenCanvasRenderingContext2D | null = null;
}

export function createCanvasCompositor() {
    return new CanvasCompositorState();
}