/** Reads the native observer's `onDuoChange` payload into a `DuoSnapshot`, or says it is malformed. */
import type {CameraDescriptor, CameraDirections, Insets, Rect, ReservedRegion, SizeClass, SizeClassValue, VerticalBarEdge, DuoSnapshot} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseSizeClassValue(value: unknown): SizeClassValue | null {
  return value === 'compact' || value === 'regular' ? value : null;
}

function parseSizeClass(value: unknown): SizeClass | null {
  if (!isRecord(value)) return null;
  const horizontal = parseSizeClassValue(value.horizontal);
  const vertical = parseSizeClassValue(value.vertical);
  return horizontal && vertical ? {horizontal, vertical} : null;
}

function parseEdge(value: unknown): {edge: VerticalBarEdge} | null {
  if (value === undefined || value === null) return {edge: null};
  return value === 'leading' || value === 'trailing' ? {edge: value} : null;
}

function parseRect(value: unknown): Rect | null {
  if (!isRecord(value) || !finite(value.x) || !finite(value.y) || !finite(value.width) || !finite(value.height)) return null;
  return {x: value.x, y: value.y, width: value.width, height: value.height};
}

function parseInsets(value: unknown): Insets | null {
  if (!isRecord(value) || !finite(value.top) || !finite(value.left) || !finite(value.bottom) || !finite(value.right)) return null;
  return {top: value.top, left: value.left, bottom: value.bottom, right: value.right};
}

function parseRegion(value: unknown): ReservedRegion | null {
  if (!isRecord(value)) return null;
  if (value.kind !== 'division' && value.kind !== 'occlusion') return null;
  if (typeof value.isActive !== 'boolean') return null;
  const frame = parseRect(value.frame);
  const margins = parseInsets(value.margins);
  return frame && margins ? {kind: value.kind, frame, margins, isActive: value.isActive} : null;
}

export function parseSnapshot(payload: unknown): DuoSnapshot | null {
  if (!isRecord(payload)) return null;
  const sizeClass = parseSizeClass(payload.sizeClass);
  const edge = parseEdge(payload.verticalBarEdge);
  if (!sizeClass || !edge || !Array.isArray(payload.regions)) return null;
  const regions: ReservedRegion[] = [];
  for (const entry of payload.regions) {
    const region = parseRegion(entry);
    if (!region) return null;
    regions.push(region);
  }
  return {sizeClass, verticalBarEdge: edge.edge, regions};
}

function parseCamera(value: unknown): CameraDescriptor | null {
  if (!isRecord(value) || typeof value.uniqueID !== 'string') return null;
  const position = value.position === 'front' || value.position === 'back' ? value.position : 'unspecified';
  return {
    uniqueID: value.uniqueID,
    localizedName: typeof value.localizedName === 'string' ? value.localizedName : '',
    deviceType: typeof value.deviceType === 'string' ? value.deviceType : '',
    position,
  };
}

function parseCameras(value: unknown): CameraDescriptor[] | null {
  if (!Array.isArray(value)) return null;
  const cameras: CameraDescriptor[] = [];
  for (const entry of value) {
    const camera = parseCamera(entry);
    if (!camera) return null;
    cameras.push(camera);
  }
  return cameras;
}

/** Reads the observer's `onCameraDirections` payload, or says it is malformed. */
export function parseCameraDirections(payload: unknown): CameraDirections | null {
  if (!isRecord(payload)) return null;
  const forward = parseCameras(payload.forward);
  const backward = parseCameras(payload.backward);
  return forward && backward ? {forward, backward, source: 'native'} : null;
}
