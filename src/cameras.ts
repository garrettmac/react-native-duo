/**
 * Which cameras face the person looking at the app. On iPhone Duo a camera's direction depends on the display the app
 * is on, and changes as the device opens and closes; a front camera can face away and a back camera can face the
 * person. Pick and mirror cameras by direction, never by position.
 */
import {useContext, useEffect} from 'react';

import {DuoContext, NO_CAMERAS} from './context';
import type {CameraDescriptor, CameraDirections} from './types';

/** Follows camera directions while mounted (iOS 27.1 and later); everywhere else `source` is `unavailable`. */
export function useCameraDirections(): CameraDirections {
  const context = useContext(DuoContext);
  const watchCameras = context?.watchCameras;
  useEffect(() => watchCameras?.(), [watchCameras]);
  return context?.cameras ?? NO_CAMERAS;
}

/** Whether a camera's preview should be mirrored: when it faces the person, whatever its position. */
export function shouldMirror(camera: Pick<CameraDescriptor, 'uniqueID'>, directions: CameraDirections): boolean {
  return directions.forward.some(c => c.uniqueID === camera.uniqueID);
}

/** Keeps `current` if it still faces the person; otherwise the first camera that does, or null when none does. */
export function forwardCamera(directions: CameraDirections, current?: string | null): CameraDescriptor | null {
  return directions.forward.find(c => c.uniqueID === current) ?? directions.forward[0] ?? null;
}
