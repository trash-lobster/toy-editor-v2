import { proxy } from "valtio";
import { CanvasState, NodeType, type MediaNode, type MediaNodeStatus, type SceneEditorCell } from "./state"

export class CanvasPresenter {
    state: CanvasState

    constructor(state: CanvasState) {
        this.state = state;
    }

    getCanvas = () => {
        return this.state;
    }

    updateCanvas = (newState: CanvasState) => {
        this.state = proxy(newState);
    }

    getSceneEditor = () => {
        return this.state.sceneEditor || { 
            cells: [], 
            aspectRatio: '16:9', 
            tracks: [{ id: 0, cells: [], }], 
        };
    }

    getNodes = () => {
        return this.state.nodes;
    }

    getTrack = (trackId: number) => {
        if (!this.state.sceneEditor) return;
        return this.state.sceneEditor.tracks.filter(track => track.id === trackId)[0];
    }

    addTrack = () => {
        if (!this.state.sceneEditor) return;
        const newId = this.state.sceneEditor.tracks.length;
        this.state.sceneEditor.tracks.push({ id: newId, cells: [], });
    }

    private getEffectiveDuration = (cell: SceneEditorCell): number => {
        const originalDuration = cell.duration || 0;
        const trimStart = cell.trimStart || 0;
        const trimEnd = cell.trimEnd || 0;
        return Math.max(0.1, originalDuration - trimStart - trimEnd);
    }

    getCellsAtGlobalTime = (clampedTime: number) => {
        if (!this.state.sceneEditor) return;
        const clips = [];

        for (let i = 0; i < this.state.sceneEditor.tracks.length; i++) {
            const cells = this.state.sceneEditor.tracks[i].cells;

            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                const effectiveDuration = this.getEffectiveDuration(cell);
                const startTime = cell.startTime || 0;
                const endTime = startTime + effectiveDuration;
            
                const epsilon = 0.001;
                const isAtStart = Math.abs(clampedTime - startTime) < epsilon;
                const isWithinClip = clampedTime >= startTime && clampedTime < endTime;

                if (isAtStart) {
                    // At or very close to clip start time (handles floating-point precision)
                    clips.push( 
                        {
                            clip: cell,
                            clipTime: 0,
                            clipIndex: i,
                            clipStartTime: startTime,
                            clipEndTime: endTime
                        }
                    );
                } else if (isWithinClip) {
                    // Normal case: time is strictly within clip boundaries
                    const clipTime = clampedTime - startTime;

                    clips.push(
                        {
                            clip: cell,
                            clipTime,
                            clipIndex: i,
                            clipStartTime: startTime,
                            clipEndTime: endTime
                        }
                    );
                }
            }

            // check if we are adding that last clip of the track
            // if (clampedTime >= totalDuration && cells.length > 0) {
            //     const lastClip = cells[cells.length - 1];
            //     const lastClipStartTime = lastClip.startTime || 0;
            //     const lastClipDuration = this.getEffectiveDuration(lastClip); // ✅ Use effective duration
    
            //     return {
            //         clip: lastClip,
            //         clipTime: lastClipDuration, // At the very end of the last clip
            //         clipIndex: cells.length - 1,
            //         clipStartTime: lastClipStartTime,
            //         clipEndTime: lastClipStartTime + lastClipDuration
            //     };
            // }
        }
        return clips;
    }

    // clipPositionToGlobalTime(clipIndex: number, clipTime: number): number {
    //     if (clipIndex < 0 || clipIndex >= this.cells.length) {
    //         return 0;
    //     }

    //     const cell = this.cells[clipIndex];
    //     const startTime = cell.startTime || 0;
    //     const effectiveDuration = this.getEffectiveDuration(cell); // ✅ Use effective duration

    //     // Clamp clip time to valid range within this clip
    //     const clampedClipTime = Math.max(0, Math.min(clipTime, effectiveDuration));

    //     return startTime + clampedClipTime;
    // }

    private calculateTrackEnd = (trackId: number) => {
        const track = this.getTrack(trackId);
        if (!track || !track.cells || track.cells.length === 0) return 0;
        
        let endTime = 0;
        for (const cell of track.cells) {
            const duration = cell.duration || 0;
            const trimStart = cell.trimStart || 0;
            const trimEnd = cell.trimEnd || 0;
            const effectiveDuration = duration - trimStart - trimEnd;
            const cellEndTime = (cell.startTime || 0) + effectiveDuration;
            
            endTime = Math.max(cellEndTime, endTime);
        }
        
        return endTime;
    }

    deleteTrack = (trackId: number) => {
        if (!this.state.sceneEditor) return;
        
        const trackIndex = this.state.sceneEditor.tracks.findIndex(track => track.id === trackId);
        if (trackIndex === -1) return;
        
        this.state.sceneEditor.tracks.splice(trackIndex, 1);
    }

    private deleteCellFromTrack = (trackId: number, mediaNodeId: string) => {
        if (!this.state.sceneEditor) return;

        const trackIndex = this.state.sceneEditor.tracks.findIndex(track => track.id === trackId);
        if (trackIndex === -1) return;

        const cellIndex = this.state.sceneEditor.tracks[trackIndex].cells.findIndex(cell => cell.mediaNodeId === mediaNodeId);
        if (cellIndex === -1) return;

        this.state.sceneEditor.tracks[trackIndex].cells.splice(cellIndex, 1);
    }

    uploadMedia = async (file: File) => {
        const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const blobUrl = URL.createObjectURL(file);

        // Determine if image or video
        const isVideo = file.type.startsWith('video/');
        const nodeType = isVideo ? NodeType.VIDEO : NodeType.IMAGE;

        // Get dimensions and duration
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        if (isVideo) {
            // Get video metadata
            const video = document.createElement('video');
            video.src = blobUrl;
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    width = video.videoWidth;
                    height = video.videoHeight;
                    duration = video.duration;
                    resolve(null);
                };
            });
        } else {
            // Get image dimensions
            const img = new Image();
            img.src = blobUrl;
            await new Promise((resolve) => {
                img.onload = () => {
                    width = img.width;
                    height = img.height;
                    resolve(null);
                };
            });
        }

        const newNode: MediaNode = {
            id: nodeId,
            type: nodeType,
            label: file.name,
            position: { x: 0, y: 0 }, // Not used in timeline
            data: {
                url: blobUrl,
                width,
                height,
                duration,
                status: 'completed' as MediaNodeStatus,
                file
            }
        };

        this.state.nodes.push(newNode);

        return nodeId;
    }

    addMediaToTimeline = (mediaNodeId: string, trackId: number = 0) => {
        const node = this.state.nodes.find(n => n.id === mediaNodeId);
        if (!node) return;
        
        // exit if the track you want to add the node to does not exist
        const track = this.getTrack(trackId);
        if (!this.state.sceneEditor?.tracks || !track) return;

        const cells = track.cells;

        // Calculate start time based on existing clips in the track
        let startTime = 0;
        if (cells.length > 0) {
            const lastCell = cells[cells.length - 1];
            const lastCellDuration = lastCell.duration || (node.type === NodeType.VIDEO ? node.data.duration : 3) || 3;
            const lastCellTrimStart = lastCell.trimStart || 0;
            const lastCellTrimEnd = lastCell.trimEnd || 0;
            const effectiveDuration = lastCellDuration - lastCellTrimStart - lastCellTrimEnd;
            startTime = (lastCell.startTime || 0) + effectiveDuration;
        }

        const cellId = `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = node.type === NodeType.VIDEO ? node.data.duration : 3;

        const newCell: SceneEditorCell = {
            id: cellId,
            mediaNodeId,
            position: cells.length,
            startTime,
            duration,
            trimStart: 0,
            trimEnd: 0,
        };

        cells.push(newCell);
    }

    handleFileUpload = async(e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => {
        const files = e.target.files;
        if (!files) return;

        const response = {
            status: 'failure'
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const mediaNodeId = await this.uploadMedia(file);
            if (mediaNodeId) {
                this.addMediaToTimeline(mediaNodeId);
                console.log('Media node id:', mediaNodeId);
                response.status = 'success';
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        return response;
    };

    removeClipFromTimeline = (clipId: string, trackId: number) => {
        if (!this.state.sceneEditor) return;
        
        // Ensure that clip id is using the mediaNodeId
        this.deleteCellFromTrack(trackId, clipId)

        // Recalculate total duration
        let totalDuration = 0;

        this.state.sceneEditor.tracks.forEach(track => {
            totalDuration = Math.max(totalDuration, this.calculateTrackEnd(track.id));
        })

        this.state.sceneEditor.totalDuration = totalDuration;
    }

    updateClip = (clipId: string, updates: Partial<SceneEditorCell>, trackId: number) => {
        if (!this.state.sceneEditor) return;

        const track = this.getTrack(trackId);
        if (!this.state.sceneEditor?.tracks || !track) return;

        const cells = track.cells;
        const index = cells.findIndex(c => c.mediaNodeId === clipId);
        if (index !== -1) {
            cells[index] = { ...cells[index], ...updates };
        }
    }

    moveClip = (clipId: string, newStartTime: number, trackId: number) => {
        if (!this.state.sceneEditor) return;

        const track = this.getTrack(trackId);
        if (!this.state.sceneEditor?.tracks || !track) return;

        const cells = track.cells;
        const index = cells.findIndex(c => c.mediaNodeId === clipId);
        if (index !== -1) {
            cells[index] = { ...cells[index], startTime: newStartTime };
        }

        // update position on the timeline
    };
}