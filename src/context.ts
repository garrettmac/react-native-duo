/** The one context every hook and `Arrangement` reads: the provider's state and the root view regions are measured from. */
import {createContext, useContext, useMemo, type ComponentRef, type RefObject} from 'react';
import {useWindowDimensions, type View} from 'react-native';

import {sizeClassFromWindow} from './sizes';
import type {CameraDirections, DuoState, WindowSize} from './types';

/** A mounted `View`: a class instance before React Native 0.88, a `ReactNativeElement` from it. */
export type ViewRef = ComponentRef<typeof View>;

export interface DuoContextValue {
  state: DuoState;
  rootRef: RefObject<ViewRef | null> | null;
  cameras: CameraDirections;
  /** Asks the provider to follow camera directions; returns the call that stops asking. */
  watchCameras: () => () => void;
}

export const NO_CAMERAS: CameraDirections = Object.freeze({forward: [], backward: [], source: 'unavailable'}) as CameraDirections;

const unwatched = () => () => {};

export const DuoContext = createContext<DuoContextValue | null>(null);

export function windowState(window: WindowSize): DuoState {
  return {sizeClass: sizeClassFromWindow(window), verticalBarEdge: null, regions: [], window, source: 'window'};
}

export function useDuoContext(): DuoContextValue {
  const placed = useContext(DuoContext);
  const {width, height} = useWindowDimensions();
  const fallback = useMemo<DuoContextValue>(() => ({state: windowState({width, height}), rootRef: null, cameras: NO_CAMERAS, watchCameras: unwatched}), [width, height]);
  return placed ?? fallback;
}

/** Everything the provider knows. Outside a provider it is the window with no regions and no bar edge. */
export function useDuo(): DuoState {
  return useDuoContext().state;
}

/** Starts a context value for a fixed state: the test provider's. */
export function fixedContext(state: DuoState, cameras: CameraDirections = NO_CAMERAS): DuoContextValue {
  return {state, rootRef: null, cameras, watchCameras: unwatched};
}
