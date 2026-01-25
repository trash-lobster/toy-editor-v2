import { proxy } from "valtio";

export class LayoutState {
    right: boolean = true;
    left: boolean = true;
}

export function createLayoutState() {
    return proxy(new LayoutState());
}