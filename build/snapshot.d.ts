/** Reads the native observer's `onDuoChange` payload into a `DuoSnapshot`, or says it is malformed. */
import type { CameraDirections, DuoSnapshot } from './types';
export declare function parseSnapshot(payload: unknown): DuoSnapshot | null;
/** Reads the observer's `onCameraDirections` payload, or says it is malformed. */
export declare function parseCameraDirections(payload: unknown): CameraDirections | null;
