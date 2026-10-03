/** The one context every hook and `Arrangement` reads: the provider's state and the root view regions are measured from. */
import { type ComponentRef, type RefObject } from 'react';
import { type View } from 'react-native';
import type { CameraDirections, DuoState, WindowSize } from './types';
/** A mounted `View`: a class instance before React Native 0.88, a `ReactNativeElement` from it. */
export type ViewRef = ComponentRef<typeof View>;
export interface DuoContextValue {
    state: DuoState;
    rootRef: RefObject<ViewRef | null> | null;
    cameras: CameraDirections;
    /** Asks the provider to follow camera directions; returns the call that stops asking. */
    watchCameras: () => () => void;
}
export declare const NO_CAMERAS: CameraDirections;
export declare const DuoContext: import("react").Context<DuoContextValue | null>;
export declare function windowState(window: WindowSize): DuoState;
export declare function useDuoContext(): DuoContextValue;
/** Everything the provider knows. Outside a provider it is the window with no regions and no bar edge. */
export declare function useDuo(): DuoState;
/** Starts a context value for a fixed state: the test provider's. */
export declare function fixedContext(state: DuoState, cameras?: CameraDirections): DuoContextValue;
