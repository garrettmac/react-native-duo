"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCameraDirections = useCameraDirections;
exports.shouldMirror = shouldMirror;
exports.forwardCamera = forwardCamera;
/**
 * Which cameras face the person looking at the app. On iPhone Duo a camera's direction depends on the display the app
 * is on, and changes as the device opens and closes; a front camera can face away and a back camera can face the
 * person. Pick and mirror cameras by direction, never by position.
 */
const react_1 = require("react");
const context_1 = require("./context");
/** Follows camera directions while mounted (iOS 27.1 and later); everywhere else `source` is `unavailable`. */
function useCameraDirections() {
    const context = (0, react_1.useContext)(context_1.DuoContext);
    const watchCameras = context?.watchCameras;
    (0, react_1.useEffect)(() => watchCameras?.(), [watchCameras]);
    return context?.cameras ?? context_1.NO_CAMERAS;
}
/** Whether a camera's preview should be mirrored: when it faces the person, whatever its position. */
function shouldMirror(camera, directions) {
    return directions.forward.some(c => c.uniqueID === camera.uniqueID);
}
/** Keeps `current` if it still faces the person; otherwise the first camera that does, or null when none does. */
function forwardCamera(directions, current) {
    return directions.forward.find(c => c.uniqueID === current) ?? directions.forward[0] ?? null;
}
//# sourceMappingURL=cameras.js.map