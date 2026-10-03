"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSnapshot = parseSnapshot;
exports.parseCameraDirections = parseCameraDirections;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function parseSizeClassValue(value) {
    return value === 'compact' || value === 'regular' ? value : null;
}
function parseSizeClass(value) {
    if (!isRecord(value))
        return null;
    const horizontal = parseSizeClassValue(value.horizontal);
    const vertical = parseSizeClassValue(value.vertical);
    return horizontal && vertical ? { horizontal, vertical } : null;
}
function parseEdge(value) {
    if (value === undefined || value === null)
        return { edge: null };
    return value === 'leading' || value === 'trailing' ? { edge: value } : null;
}
function parseRect(value) {
    if (!isRecord(value) || !finite(value.x) || !finite(value.y) || !finite(value.width) || !finite(value.height))
        return null;
    return { x: value.x, y: value.y, width: value.width, height: value.height };
}
function parseInsets(value) {
    if (!isRecord(value) || !finite(value.top) || !finite(value.left) || !finite(value.bottom) || !finite(value.right))
        return null;
    return { top: value.top, left: value.left, bottom: value.bottom, right: value.right };
}
function parseRegion(value) {
    if (!isRecord(value))
        return null;
    if (value.kind !== 'division' && value.kind !== 'occlusion')
        return null;
    if (typeof value.isActive !== 'boolean')
        return null;
    const frame = parseRect(value.frame);
    const margins = parseInsets(value.margins);
    return frame && margins ? { kind: value.kind, frame, margins, isActive: value.isActive } : null;
}
function parseSnapshot(payload) {
    if (!isRecord(payload))
        return null;
    const sizeClass = parseSizeClass(payload.sizeClass);
    const edge = parseEdge(payload.verticalBarEdge);
    if (!sizeClass || !edge || !Array.isArray(payload.regions))
        return null;
    const regions = [];
    for (const entry of payload.regions) {
        const region = parseRegion(entry);
        if (!region)
            return null;
        regions.push(region);
    }
    return { sizeClass, verticalBarEdge: edge.edge, regions };
}
function parseCamera(value) {
    if (!isRecord(value) || typeof value.uniqueID !== 'string')
        return null;
    const position = value.position === 'front' || value.position === 'back' ? value.position : 'unspecified';
    return {
        uniqueID: value.uniqueID,
        localizedName: typeof value.localizedName === 'string' ? value.localizedName : '',
        deviceType: typeof value.deviceType === 'string' ? value.deviceType : '',
        position,
    };
}
function parseCameras(value) {
    if (!Array.isArray(value))
        return null;
    const cameras = [];
    for (const entry of value) {
        const camera = parseCamera(entry);
        if (!camera)
            return null;
        cameras.push(camera);
    }
    return cameras;
}
/** Reads the observer's `onCameraDirections` payload, or says it is malformed. */
function parseCameraDirections(payload) {
    if (!isRecord(payload))
        return null;
    const forward = parseCameras(payload.forward);
    const backward = parseCameras(payload.backward);
    return forward && backward ? { forward, backward, source: 'native' } : null;
}
//# sourceMappingURL=snapshot.js.map