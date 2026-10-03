"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_CLEARANCE = void 0;
exports.keepOut = keepOut;
exports.cameraClearance = cameraClearance;
exports.maxInsets = maxInsets;
exports.clearancePadding = clearancePadding;
exports.useCameraClearance = useCameraClearance;
/**
 * How far controls keep from the camera occlusions: each region's frame grown by its margins is the keep-out, and it
 * belongs to the window edge it clears with the least depth, so the camera inset in the closed iPhone Duo's top
 * corner keeps the top clear, not the side.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
const hooks_1 = require("./hooks");
exports.NO_CLEARANCE = { top: 0, left: 0, bottom: 0, right: 0 };
const EDGES = ['top', 'bottom', 'left', 'right'];
/** A region's frame grown by its margins: what controls keep out of. */
function keepOut({ frame, margins }) {
    return {
        x: frame.x - margins.left,
        y: frame.y - margins.top,
        width: frame.width + margins.left + margins.right,
        height: frame.height + margins.top + margins.bottom,
    };
}
function depths(box, window) {
    const depth = (value, length) => (value > 0 && value <= length ? value : null);
    return {
        top: depth(box.y + box.height, window.height),
        bottom: depth(window.height - box.y, window.height),
        left: depth(box.x + box.width, window.width),
        right: depth(window.width - box.x, window.width),
    };
}
function cameraClearance(regions, window) {
    const result = { ...exports.NO_CLEARANCE };
    for (const region of regions) {
        if (region.kind !== 'occlusion')
            continue;
        const byEdge = depths(keepOut(region), window);
        let nearest = null;
        for (const edge of EDGES) {
            const value = byEdge[edge];
            if (value !== null && (nearest === null || value < byEdge[nearest]))
                nearest = edge;
        }
        if (nearest !== null)
            result[nearest] = Math.max(result[nearest], byEdge[nearest]);
    }
    return result;
}
/** The larger of two insets on every edge, for folding the safe area in. */
function maxInsets(a, b) {
    return { top: Math.max(a.top, b.top), left: Math.max(a.left, b.left), bottom: Math.max(a.bottom, b.bottom), right: Math.max(a.right, b.right) };
}
/** Physical insets as padding, each at least `base`; swaps back the sides React Native swaps in a right-to-left layout. */
function clearancePadding(insets, base = 0) {
    const swapped = react_native_1.I18nManager.isRTL && react_native_1.I18nManager.getConstants().doLeftAndRightSwapInRTL;
    return {
        paddingTop: Math.max(base, insets.top),
        paddingBottom: Math.max(base, insets.bottom),
        paddingLeft: Math.max(base, swapped ? insets.right : insets.left),
        paddingRight: Math.max(base, swapped ? insets.left : insets.right),
    };
}
/**
 * The clearance an immersive screen's controls keep from the cameras. Pass `includeInactive` only on a screen that
 * turns a camera on: the inner camera is reserved only while it is on.
 */
function useCameraClearance({ includeInactive = false } = {}) {
    const regions = (0, hooks_1.useReservedRegions)({ kind: 'occlusion', includeInactive });
    const { window } = (0, context_1.useDuo)();
    return (0, react_1.useMemo)(() => cameraClearance(regions, window), [regions, window]);
}
//# sourceMappingURL=clearance.js.map