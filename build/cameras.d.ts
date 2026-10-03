import type { CameraDescriptor, CameraDirections } from './types';
/** Follows camera directions while mounted (iOS 27.1 and later); everywhere else `source` is `unavailable`. */
export declare function useCameraDirections(): CameraDirections;
/** Whether a camera's preview should be mirrored: when it faces the person, whatever its position. */
export declare function shouldMirror(camera: Pick<CameraDescriptor, 'uniqueID'>, directions: CameraDirections): boolean;
/** Keeps `current` if it still faces the person; otherwise the first camera that does, or null when none does. */
export declare function forwardCamera(directions: CameraDirections, current?: string | null): CameraDescriptor | null;
