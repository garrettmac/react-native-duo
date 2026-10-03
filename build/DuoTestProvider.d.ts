/**
 * Renders children as if the app were in one pose, with no native view: for jest, screenshots and in-app previews.
 * Like `DuoProvider` it wraps children in a root view, so region frames are measured from it.
 */
import { type ReactNode } from 'react';
import { type Pose, type PoseName } from './poses';
import type { CameraDirections } from './types';
export interface DuoTestProviderProps {
    pose: PoseName | Pose;
    /** What `useCameraDirections()` reports; nothing by default. */
    cameras?: CameraDirections;
    children: ReactNode;
}
export declare function DuoTestProvider({ pose, cameras, children }: DuoTestProviderProps): import("react").JSX.Element;
