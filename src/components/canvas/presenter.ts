import { proxy } from "valtio";
import { CanvasState, NodeType, type MediaNode, type MediaNodeStatus, type SceneEditorCell } from "./state"
import type { VirtualTimelineState } from "../video-editor/state";
import type { VideoElementPoolPresenter } from "../video-editor/video-playback/video-element-pool/presenter";
import { inferVideoMime } from "../../lib/util";

export const TRACK_LIMIT = 3;

export class CanvasPresenter {
    state: CanvasState;
    timelineState: VirtualTimelineState;
    videoPoolPresenter: VideoElementPoolPresenter;
    _offscreenContainer: HTMLElement | null = null;

    constructor(state: CanvasState, timelineState: VirtualTimelineState, videoPoolPresenter: VideoElementPoolPresenter) {
        this.state = state;
        this.timelineState = timelineState;
        this.videoPoolPresenter = videoPoolPresenter;
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
    
    hasNodes = () => {
        return this.state.nodes && this.state.nodes.length > 0;
    }

    getTrack = (trackId: number) => {
        if (!this.state.sceneEditor) return;
        return this.state.sceneEditor.tracks.filter(track => track.id === trackId)[0];
    }

    getCurrentTrack = () => {
        if (!this.state.sceneEditor) return;
        return this.getTrack(this.state.sceneEditor.currentTrack ?? 0);
    }

    setCurrentTrack = (trackId: number) => {
        if (!this.state.sceneEditor) return;
        const track = this.state.sceneEditor.tracks.filter(track => track.id === trackId)[0];
        if (!track) return;
        this.state.sceneEditor.currentTrack = trackId;
    }

    addTrack = () => {
        if (!this.state.sceneEditor) return;
        if (this.state.sceneEditor.tracks.length >= TRACK_LIMIT) return;
        const newId = this.state.sceneEditor.tracks.length;
        this.state.sceneEditor.tracks.push({ 
            id: newId, 
            cells: [], 
            effects: {
                opacity: 1,
                brightness: 1,
                contrast: 1,
                saturation: 1,
            }
        });
    }

    // update effects
    setOpacity = (newVal: number) => {
        if (!this.state.sceneEditor) return;
        
        const track = this.getTrack(this.state.sceneEditor.currentTrack ?? 0);
        
        if (!track || !track.effects) return;
        track.effects.opacity = newVal;
        console.log(track.effects);
    }

    setBrightness = (newVal: number) => {
        if (!this.state.sceneEditor) return;
        
        const track = this.getTrack(this.state.sceneEditor.currentTrack ?? 0);
        
        if (!track || !track.effects) return;
        track.effects.brightness = newVal;
        console.log(track.effects);
    }

    setContrast = (newVal: number) => {
        if (!this.state.sceneEditor) return;
        
        const track = this.getTrack(this.state.sceneEditor.currentTrack ?? 0);
        
        if (!track || !track.effects) return;
        track.effects.contrast = newVal;
        console.log(track.effects);
    }

    setSaturation = (newVal: number) => {
        if (!this.state.sceneEditor) return;
        
        const track = this.getTrack(this.state.sceneEditor.currentTrack ?? 0);
        
        if (!track || !track.effects) return;
        track.effects.saturation = newVal;
        console.log(track.effects);
    }

    ensureOffscreenContainer = () => {
        if (this._offscreenContainer) return this._offscreenContainer;
        const c = document.createElement('div');
        c.id = 'video-offscreen-container';
        Object.assign(c.style, {
            position: 'fixed',
            left: '-10000px',
            top: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: '0',
            zIndex: '-1',
        });
        document.body.appendChild(c);
        this._offscreenContainer = c;
        return c;
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
                const startTime = cell.startTime || 0 + (cell.trimStart || 0);
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
        }
        return clips;
    }

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
            const video = document.createElement('video');
            const source = document.createElement('source');
            const mime = inferVideoMime(file);
            source.type = mime;
            source.src = blobUrl;
            video.appendChild(source);

            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;

            const support = video.canPlayType(mime);
            if (!support) {
                // try a few fallbacks (won't help if the actual file codec isn't supported)
                const fallbacks = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
                for (const fb of fallbacks) {
                if (fb === mime) continue;
                if (video.canPlayType(fb)) {
                    source.type = fb;
                    break;
                }
                }
            }

            video.load();

            await new Promise((resolve, reject) => {
                video.onloadeddata = () => {
                    width = video.videoWidth;
                    height = video.videoHeight;
                    duration = video.duration;
                    resolve(null);
                };
                video.onerror = () => {
                    reject(new Error('Video failed to load metadata — likely unsupported codec.'));
                };
            });

            this.videoPoolPresenter.addVideoToPool(nodeId, video);
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
            trackId,
        };

        cells.push(newCell);

        let totalDuration = 0;
        this.state.sceneEditor.tracks.forEach(track => {
            totalDuration = Math.max(totalDuration, this.calculateTrackEnd(track.id));
        });
        // total duration is being updated here
        this.timelineState.totalDuration = totalDuration;
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

        this.timelineState.totalDuration = totalDuration;
    }

    updateClip = (clipId: string, updates: Partial<SceneEditorCell>, trackId: number) => {
        if (!this.state.sceneEditor) return;

        const track = this.getTrack(trackId);
        if (!this.state.sceneEditor?.tracks || !track) return;

        const cells = track.cells;
        const index = cells.findIndex(c => c.id === clipId);
        if (index !== -1) {
            cells[index] = { ...cells[index], ...updates };
        }
    }

    moveClip = (clipId: string, newStartTime: number, trackId: number) => {
        if (!this.state.sceneEditor) return;

        const track = this.getTrack(trackId);
        if (!this.state.sceneEditor?.tracks || !track) return;

        const cells = track.cells;
        const index = cells.findIndex(c => c.id === clipId);
        if (index !== -1) {
            cells[index] = { ...cells[index], startTime: newStartTime, trackId };
        }

        // Sort cells by start time
        track.cells.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

        // Recalculate total duration
        let totalDuration = 0;
        this.state.sceneEditor.tracks.forEach(track => {
            totalDuration = Math.max(totalDuration, this.calculateTrackEnd(track.id));
        });
        this.timelineState.totalDuration = totalDuration;
    };

    moveClipToTrack = (clipId: string, sourceTrackId: number, targetTrackId: number, newStartTime: number) => {
        if (!this.state.sceneEditor) return false;

        const sourceTrack = this.getTrack(sourceTrackId);
        const targetTrack = this.getTrack(targetTrackId);
        if (!sourceTrack || !targetTrack) return false;

        // Find and remove from source track
        const sourceIndex = sourceTrack.cells.findIndex(c => c.id === clipId);
        if (sourceIndex === -1) return false;

        const cell = sourceTrack.cells[sourceIndex];
        sourceTrack.cells.splice(sourceIndex, 1);

        // Add to target track with new start time
        cell.startTime = newStartTime;
        cell.trackId = targetTrackId;
        targetTrack.cells.push(cell);

        // Sort target track cells by start time
        targetTrack.cells.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

        // Recalculate total duration
        let totalDuration = 0;
        this.state.sceneEditor.tracks.forEach(track => {
            totalDuration = Math.max(totalDuration, this.calculateTrackEnd(track.id));
        });
        this.timelineState.totalDuration = totalDuration;

        return true;
    };

    swapClips = (clip1Id: string, track1Id: number, clip2Id: string, track2Id: number) => {
        if (!this.state.sceneEditor) return false;

        const track1 = this.getTrack(track1Id);
        const track2 = this.getTrack(track2Id);
        if (!track1 || !track2) return false;

        const cell1Index = track1.cells.findIndex(c => c.id === clip1Id);
        const cell2Index = track2.cells.findIndex(c => c.id === clip2Id);
        if (cell1Index === -1 || cell2Index === -1) return false;

        const cell1 = track1.cells[cell1Index];
        const cell2 = track2.cells[cell2Index];

        // Swap start times
        const tempStartTime = cell1.startTime;
        cell1.startTime = cell2.startTime;
        cell2.startTime = tempStartTime;

        // If different tracks, swap cells between tracks
        if (track1Id !== track2Id) {
            track1.cells[cell1Index] = cell2;
            track2.cells[cell2Index] = cell1;
            
            // Sort both tracks after swapping
            track1.cells.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
            track2.cells.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
        } else {
            // Same track, just sort
            track1.cells.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
        }

        return true;
    };

    checkCollision = (clipId: string, trackId: number, newStartTime: number, duration: number) => {
        const track = this.getTrack(trackId);
        if (!track) return { valid: true, swapTarget: null };

        const newEndTime = newStartTime + duration;

        // Find any overlapping clip (excluding the dragged clip itself)
        for (const cell of track.cells) {
            if (cell.id === clipId) continue;

            const cellStartTime = cell.startTime || 0;
            const cellDuration = cell.duration || 0;
            const cellTrimStart = cell.trimStart || 0;
            const cellTrimEnd = cell.trimEnd || 0;
            const cellEffectiveDuration = cellDuration - cellTrimStart - cellTrimEnd;
            const cellEndTime = cellStartTime + cellEffectiveDuration;

            // Check for overlap
            const overlaps = newStartTime < cellEndTime && newEndTime > cellStartTime;
            if (!overlaps) continue;

            // Calculate overlap amount
            const overlapStart = Math.max(newStartTime, cellStartTime);
            const overlapEnd = Math.min(newEndTime, cellEndTime);
            const overlapDuration = overlapEnd - overlapStart;

            // Calculate overlap percentage for both clips
            const overlapPercentageOfDragged = overlapDuration / duration;
            const overlapPercentageOfTarget = overlapDuration / cellEffectiveDuration;

            // If >50% overlap of either clip, trigger swap
            if (overlapPercentageOfDragged > 0.5 || overlapPercentageOfTarget > 0.5) {
                return { valid: true, swapTarget: cell.id };
            }

            // If <50% overlap of both clips, try to snap to end
            if (overlapPercentageOfDragged < 0.5 && overlapPercentageOfTarget < 0.5) {
                // Determine if we're approaching from the left or right
                const approachingFromLeft = newStartTime < cellStartTime;
                
                if (approachingFromLeft) {
                    // Snap to the left edge (before the existing clip)
                    const snappedTime = cellStartTime - duration;
                    if (snappedTime >= 0) {
                        return { valid: true, swapTarget: null, snapTime: snappedTime };
                    }
                } else {
                    // Snap to the right edge (after the existing clip)
                    const snappedTime = cellEndTime;
                    return { valid: true, swapTarget: null, snapTime: snappedTime };
                }
            }

            // Collision detected but not enough for swap and can't snap
            return { valid: false, swapTarget: null };
        }

        // No collision, valid drop
        return { valid: true, swapTarget: null };
    };
}