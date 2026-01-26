import { useSnapshot } from 'valtio';
import { CanvasPresenter } from './components/canvas/presenter';
import { createCanvasState } from './components/canvas/state';
import { installEffectsEditor } from './components/effects-editor/install';
import { installHeader } from './components/header/install';
import { installInspector } from './components/inspector/install';
import { Skeleton } from './components/skeleton';
import { createLayoutState } from './components/state';
import { installVideoEditor } from './components/video-editor/install';
import { createVirtualTimelineState } from './components/video-editor/state';
import { createVideoElementPool } from './components/video-editor/video-playback/video-element-pool/state';
import { VideoElementPoolPresenter } from './components/video-editor/video-playback/video-element-pool/presenter';

export function installApp() {
    const layoutState = createLayoutState();
    const layoutPresenter = {
        toggleLeft: () => layoutState.left = !layoutState.left,
        toggleRight: () => layoutState.right = !layoutState.right
    }

    const virtualTimelineState = createVirtualTimelineState();
    const videoPool = createVideoElementPool();
    const videoPoolPresenter = new VideoElementPoolPresenter(videoPool);

    const canvasState = createCanvasState();
    const canvasPresenter = new CanvasPresenter(canvasState, virtualTimelineState, videoPoolPresenter);

    const { Header } = installHeader(layoutPresenter.toggleLeft, layoutPresenter.toggleRight);
    const { Inspector } = installInspector(canvasPresenter.handleFileUpload);
    const { EffectEditor } = installEffectsEditor();
    const { VideoEditor } = installVideoEditor(
        canvasState,
        canvasPresenter,
        videoPoolPresenter,
        virtualTimelineState,
        canvasPresenter.addTrack,
        canvasPresenter.handleFileUpload,
    );

    const App = () => {
        const { left, right } = useSnapshot(layoutState);

        return (
            <Skeleton 
                left={left}
                right={right}
                Header={Header}
                Inspector={Inspector}
                EffectEditor={EffectEditor}
                VideoEditor={VideoEditor}
            />
        )
    }

    return {
        App,
    }
}