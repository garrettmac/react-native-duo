"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeFold = activeFold;
exports.useFold = useFold;
exports.avoidanceOffset = avoidanceOffset;
exports.AvoidReservedRegions = AvoidReservedRegions;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * The fold: the active division crossing the app's window, and how a control steps out of it the way Apple's own
 * sheets, alerts, menus and toolbar buttons do. Scrolling content may pass under the fold; tappable controls may not.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
const measure_1 = require("./measure");
/** The first active division, or null when the device is closed, fully open, or not foldable. */
function activeFold(regions) {
    const region = regions.find(r => r.kind === 'division' && r.isActive);
    if (!region)
        return null;
    return { frame: region.frame, margins: region.margins, axis: region.frame.height >= region.frame.width ? 'horizontal' : 'vertical' };
}
function useFold() {
    const { regions } = (0, context_1.useDuo)();
    return (0, react_1.useMemo)(() => activeFold(regions), [regions]);
}
function keepOut({ frame, margins }) {
    return {
        x: frame.x - margins.left,
        y: frame.y - margins.top,
        width: frame.width + margins.left + margins.right,
        height: frame.height + margins.top + margins.bottom,
    };
}
function overlaps(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
/**
 * How far a box (in root points) moves to clear every active reserved region it overlaps: along the fold's axis,
 * toward the side its center is already on. Zero when it overlaps nothing.
 */
function avoidanceOffset(box, regions) {
    let x = 0;
    let y = 0;
    for (const region of regions) {
        if (!region.isActive)
            continue;
        const zone = keepOut(region);
        const moved = { ...box, x: box.x + x, y: box.y + y };
        if (!overlaps(moved, zone))
            continue;
        const sideways = region.kind === 'division' ? region.frame.height >= region.frame.width : zone.width <= zone.height;
        if (sideways) {
            const before = moved.x + moved.width / 2 < zone.x + zone.width / 2;
            x += before ? zone.x - (moved.x + moved.width) : zone.x + zone.width - moved.x;
        }
        else {
            const above = moved.y + moved.height / 2 < zone.y + zone.height / 2;
            y += above ? zone.y - (moved.y + moved.height) : zone.y + zone.height - moved.y;
        }
    }
    return { x, y };
}
/**
 * Wraps a tappable control and nudges it out of the fold and any active camera region by the smallest move that
 * clears it. Wrap buttons, toggles and chips; never wrap scrolling content.
 */
function AvoidReservedRegions({ children, style, testID }) {
    const { regions } = (0, context_1.useDuo)();
    const { ref, onLayout, size, origin } = (0, measure_1.useArrangementBox)();
    const offset = (0, react_1.useMemo)(() => (size ? avoidanceOffset({ x: origin.x, y: origin.y, width: size.width, height: size.height }, regions) : { x: 0, y: 0 }), [size, origin, regions]);
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { ref: ref, testID: testID, onLayout: onLayout, style: [style, { transform: [{ translateX: offset.x }, { translateY: offset.y }] }], children: children }));
}
//# sourceMappingURL=fold.js.map