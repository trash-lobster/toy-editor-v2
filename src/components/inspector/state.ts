import { proxy } from "valtio";

export type InspectorTab = 'media' | 'audio' | 'text';

export class InspectorState {
    currentTab: InspectorTab = 'media';
}

export function createInspectorState() {
    return proxy(new InspectorState());
}
