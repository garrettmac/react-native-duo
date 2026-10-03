"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetPlacement = sheetPlacement;
exports.sheetControlsStandVertical = sheetControlsStandVertical;
exports.rowSidePadding = rowSidePadding;
exports.columnInsetTop = columnInsetTop;
exports.useSheetPose = useSheetPose;
/**
 * Where a sheet sits and how its controls stand in each pose, after Apple's sheet behavior on iPhone Duo: the whole
 * width on a compact window, its controls standing on the side by default; centered (or leading or trailing, as asked)
 * on a regular window; beside an active fold, never across it. A sheet whose vertical bar is disabled keeps a
 * horizontal row that stops short of the outer camera.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const arrangement_layout_1 = require("./arrangement-layout");
const clearance_1 = require("./clearance");
const context_1 = require("./context");
function sheetPlacement({ window, regions, regular, rtl, placement = 'automatic', insetTop = 0, topGap = 0, modal = true }) {
    const fullHeight = window.height - insetTop - topGap;
    const division = (0, arrangement_layout_1.activeDivision)({ size: window, origin: { x: 0, y: 0 }, regions });
    if (division !== null) {
        const [leading, trailing] = (0, arrangement_layout_1.splitParts)(window, division.axis, division, rtl);
        const side = placement === 'leading' && division.axis === 'horizontal' ? 'leading' : 'trailing';
        const part = side === 'leading' ? leading : trailing;
        const height = division.axis === 'horizontal' ? fullHeight : part.height;
        return { split: true, x: part.x, width: part.width, height, y: window.height - height, side };
    }
    if (regular) {
        const [leading, trailing] = (0, arrangement_layout_1.splitParts)(window, 'horizontal', null, rtl);
        const y = window.height - fullHeight;
        if (placement === 'leading')
            return { split: true, x: leading.x, width: leading.width, height: fullHeight, y, side: 'leading' };
        if (placement === 'trailing')
            return { split: true, x: trailing.x, width: trailing.width, height: fullHeight, y, side: 'trailing' };
        const width = trailing.width;
        return { split: true, x: Math.round((window.width - width) / 2), width, height: fullHeight, y, side: 'center' };
    }
    return modal
        ? { split: false, x: 0, width: window.width, height: window.height - topGap, y: topGap, side: 'full' }
        : { split: false, x: 0, width: window.width, height: null, y: null, side: 'full' };
}
/**
 * Whether a sheet's controls stand vertical: on the closed phone by default; on the open display only in a trailing
 * sheet where the system stands bars on the side; never when the vertical bar is disabled.
 */
function sheetControlsStandVertical({ edge, sizeClass, side, verticalBarBehavior = 'automatic' }) {
    if (verticalBarBehavior === 'disabled' || edge === null)
        return false;
    if (sizeClass.horizontal === 'compact')
        return true;
    return side === 'trailing';
}
/**
 * The padding a horizontal row of controls keeps from the camera occlusions touching the window's sides, less what
 * the panel already sits in from them. Physical sides, swapped back where React Native swaps them in right to left.
 */
function rowSidePadding(clearance, placement, windowWidth, base) {
    const left = Math.max(base, clearance.left - placement.x);
    const right = Math.max(base, clearance.right - (windowWidth - placement.x - placement.width));
    const swapped = react_native_1.I18nManager.isRTL && react_native_1.I18nManager.getConstants().doLeftAndRightSwapInRTL;
    return swapped ? { paddingLeft: right, paddingRight: left } : { paddingLeft: left, paddingRight: right };
}
/**
 * The top padding a vertical column of sheet controls keeps so its first control lands below every active camera
 * occlusion (grown by its margins) that the column's own strip of the panel runs under. A camera elsewhere along the
 * top, such as over the other side of the panel, moves nothing.
 */
function columnInsetTop({ regions, placement, panelTop, edge, rtl, columnWidth, base }) {
    const physicalLeft = (edge === 'leading') !== rtl;
    const left = physicalLeft ? placement.x : placement.x + placement.width - columnWidth;
    const right = left + columnWidth;
    const boxes = regions
        .filter(region => region.kind === 'occlusion' && region.isActive)
        .map(clearance_1.keepOut)
        .filter(box => box.x < right && box.x + box.width > left)
        .sort((a, b) => a.y - b.y);
    // The first control is about as tall as the column is wide; a camera it would touch pushes it down past the camera.
    let inset = base;
    for (const box of boxes) {
        const top = panelTop + inset;
        if (box.y < top + columnWidth && box.y + box.height > top)
            inset = box.y + box.height - panelTop;
    }
    return inset;
}
/** Everything a custom sheet needs to follow the pose, re-read on every change. */
function useSheetPose({ placement = 'automatic', verticalBarBehavior = 'automatic', modal = true, insetTop = 0, topGap = 0, columnWidth = 44, columnPadding = 0, } = {}) {
    const { window, regions, sizeClass, verticalBarEdge } = (0, context_1.useDuo)();
    const clearance = (0, clearance_1.useCameraClearance)();
    const regular = sizeClass.horizontal === 'regular';
    const resolved = (0, react_1.useMemo)(() => sheetPlacement({ window, regions, regular, rtl: react_native_1.I18nManager.isRTL, placement, insetTop, topGap, modal }), [window, regions, regular, placement, insetTop, topGap, modal]);
    const vertical = sheetControlsStandVertical({ edge: verticalBarEdge, sizeClass, side: resolved.side, verticalBarBehavior });
    const inset = (0, react_1.useMemo)(() => vertical && verticalBarEdge !== null && resolved.y !== null
        ? columnInsetTop({ regions, placement: resolved, panelTop: resolved.y, edge: verticalBarEdge, rtl: react_native_1.I18nManager.isRTL, columnWidth, base: columnPadding })
        : null, [vertical, verticalBarEdge, resolved, regions, columnWidth, columnPadding]);
    return { window, placement: resolved, vertical, edge: verticalBarEdge, clearance, columnInsetTop: inset };
}
//# sourceMappingURL=sheet.js.map