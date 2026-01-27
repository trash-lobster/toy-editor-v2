import { proxy } from "valtio";

export enum NodeType {
  IMAGE = 'image',
  VIDEO = 'video',
}

// Base node interface
export interface BaseNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
}

// Media node status types
export type MediaNodeStatus = 'uploading' | 'processing' | 'completed' | 'error';

// Media node (image or video)
export interface MediaNode extends BaseNode {
    type: NodeType.IMAGE | NodeType.VIDEO;
    data: {
        url: string; // Will be blob URL in standalone version
        width?: number;
        height?: number;
        duration?: number; // for videos
        status: MediaNodeStatus;
        file?: File; // Reference to original file
    };
}

// Union type for supported nodes
export type Node = MediaNode;

export interface MediaTrack {
    id: number, // should simply by their track idx for now
    cells: SceneEditorCell[], // keeps a note of the sceneEditorCell by their id
    effects?: ClipEffects,
}

export interface ClipEffects {
    opacity?: number;           // 0-1 (default: 1)
    
    // Color adjustments (CSS filter values)
    brightness?: number;        // 0-2+ (default: 1, where 1 = no change)
    contrast?: number;          // 0-2+ (default: 1)
    saturation?: number;        // 0-2+ (default: 1, where 0 = grayscale)
}

export interface SceneEditorCell {
    id: string;
    mediaNodeId: string; // Reference to a media node
    position: number; // Position in the sequence (legacy, kept for backward compatibility)
    // Time-based positioning
    startTime?: number; // Time position in seconds (0, 5.5, 12.3)
    duration?: number; // Clip duration in seconds
    trimStart?: number; // Seconds trimmed from source start
    trimEnd?: number; // Seconds trimmed from source end
}

export interface SceneEditor {
    tracks: MediaTrack[];
    aspectRatio: string; // Default "16:9"
    currentTrack?: number; // default to 0
    zoom?: number; // Zoom level (1.0 = normal)
}

// Canvas structure (simplified for standalone)
export interface Canvas {
    id: string;
    name: string;
    nodes: Node[];
    sceneEditor?: SceneEditor;
}

export class CanvasState {
    id: string;
    name: string;
    nodes: Node[];
    sceneEditor?: SceneEditor;

    constructor() {
        this.id = 'timeline';
        this.name = 'Timeline Editor';
        this.nodes = [];
        this.sceneEditor = {
            aspectRatio: '16:9',
            zoom: 1.0,
            currentTrack: 0,
            tracks: [ 
                { 
                    id: 0, 
                    cells: [],
                    effects: {
                        opacity: 1,
                        brightness: 1,
                        contrast: 1,
                        saturation: 1,
                    }
                } 
            ],
        }
    }
}

export function createCanvasState() {
    return proxy(new CanvasState());
}
