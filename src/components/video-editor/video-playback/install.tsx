import { useSnapshot } from "valtio/react";
import { VideoPlayback as InternalVideoPlayback } from "./video-playback";
import { createVideoPlaybackState } from "./state";


export function installVideoPlayback() {
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
        const { isPlaying, globalTime, totalDuration } = useSnapshot(videoPlaybackState);
        
        return (
            <InternalVideoPlayback 
                isPlaying={isPlaying}
                globalTime={globalTime}
                totalDuration={totalDuration}
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
