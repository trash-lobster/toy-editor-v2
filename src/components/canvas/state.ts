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
    // Timeline state
    totalDuration?: number; // Calculated total duration
    currentTime?: number; // Playhead position in seconds
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
            totalDuration: 0,
            currentTime: 0,
            zoom: 1.0,
            tracks: [ { id: 0, cells: [], } ],
        }
    }
}

export function createCanvasState() {
    return proxy(new CanvasState());
}
