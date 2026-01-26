import { useSnapshot } from "valtio/react";
import { VideoPlayback as InternalVideoPlayback } from "./video-playback";
import { createVideoPlaybackState } from "./state";
import type { CanvasState } from "../../canvas/state";


export function installVideoPlayback(canvasState: CanvasState) {
    const videoPlaybackState = createVideoPlaybackState();
    
    const setIsPlaying = (playing: boolean) => {
        videoPlaybackState.isPlaying = playing;
    };
    
    const setGlobalTime = (time: number) => {
        videoPlaybackState.globalTime = time;
    };
    
    const setTotalDuration = (duration: number) => {
        videoPlaybackState.totalDuration = duration;
    };
    
    const togglePlayback = () => {
        videoPlaybackState.isPlaying = !videoPlaybackState.isPlaying;
    };

    const VideoPlayback = () => {
        const { isPlaying, globalTime, } = useSnapshot(videoPlaybackState);
        const { sceneEditor, } = useSnapshot(canvasState);
        
        return (
            <InternalVideoPlayback 
                isPlaying={isPlaying}
                globalTime={globalTime}
                totalDuration={sceneEditor?.totalDuration ?? 0}
            />
        );
    };
    
    return {
        VideoPlayback,
        setIsPlaying,
        setGlobalTime,
        setTotalDuration,
        togglePlayback,
    };
}
