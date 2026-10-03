"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PANE_TRAILING_TESTID = exports.PANE_LEADING_TESTID = exports.PANE_LAYOUT_TESTID = void 0;
exports.PaneProvider = PaneProvider;
exports.usePane = usePane;
exports.sidebarParts = sidebarParts;
exports.sidebarWidth = sidebarWidth;
exports.PaneLayout = PaneLayout;
exports.useSplitWindow = useSplitWindow;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * The pane a component draws in: the whole window on a phone, one part of a split on the open iPhone Duo, an iPad or
 * either side of an active fold. Components size to `usePane()`, never to the window.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const arrangement_layout_1 = require("./arrangement-layout");
const context_1 = require("./context");
const measure_1 = require("./measure");
const PaneContext = (0, react_1.createContext)(null);
function PaneProvider({ pane, children }) {
    return (0, jsx_runtime_1.jsx)(PaneContext.Provider, { value: pane, children: children });
}
/** The pane this component is in; outside any pane, the app's whole window. */
function usePane() {
    const placed = (0, react_1.useContext)(PaneContext);
    const { window } = (0, context_1.useDuo)();
    return (0, react_1.useMemo)(() => placed ?? { split: false, side: 'only', x: 0, y: 0, width: window.width, height: window.height, hidden: false }, [placed, window]);
}
exports.PANE_LAYOUT_TESTID = 'duo-pane-layout';
exports.PANE_LEADING_TESTID = 'duo-pane-leading';
exports.PANE_TRAILING_TESTID = 'duo-pane-trailing';
/** The two frames of a list and its detail side by side with no fold: the list at `leadingWidth`, leading first. */
function sidebarParts(size, leadingWidth, rtl) {
    const width = Math.round(Math.min(Math.max(leadingWidth, 0), size.width));
    const list = { x: rtl ? size.width - width : 0, y: 0, width, height: size.height };
    const detail = { x: rtl ? 0 : width, y: 0, width: size.width - width, height: size.height };
    return [list, detail];
}
/** The list's width beside its detail: a fraction of the width within a minimum and a maximum, never over half. */
function sidebarWidth(width, { fraction = 0.35, min = 320, max } = {}) {
    const half = width / 2;
    const ceiling = Math.min(max ?? half, half);
    return Math.min(Math.max(width * fraction, Math.min(min, ceiling)), ceiling);
}
function splitAxis(arrangement, size, division, regular) {
    if (division)
        return division.axis;
    if (arrangement === 'side-by-side')
        return size.width > size.height ? 'horizontal' : 'vertical';
    if (arrangement === 'sheet')
        return null;
    return regular ? 'horizontal' : null;
}
/**
 * Two layers or two contents sharing a window. Leading is where you are, trailing is what you picked.
 * - `sheet`: a map with a sheet over it, Apple's overlay arrangement: layered in every pose but an active fold, which
 *   puts the map on one side and the sheet on the other. Size the sheet to `usePane()`; on a regular width keep it a
 *   card at the bottom center rather than the full width.
 * - `list-detail`: a list and the row it opened. One pane on a compact window (`compact` says which), both on a regular one.
 * - `side-by-side`: two contents at once. Side by side when wider than tall, stacked when taller than wide.
 * An active fold always divides the two and nothing straddles it. Both stay mounted in every pose, so folding keeps
 * their state; each child reads its own part through `usePane()`.
 */
function PaneLayout({ leading, trailing, arrangement = 'sheet', compact = 'leading', leadingFraction, minLeadingWidth, maxLeadingWidth, split: forced = 'auto', leadingStyle, trailingStyle, style, testID = exports.PANE_LAYOUT_TESTID, }) {
    const { sizeClass, regions } = (0, context_1.useDuo)();
    const outer = usePane();
    const { ref, onLayout, size: measured, origin } = (0, measure_1.useArrangementBox)();
    const size = measured ?? { width: outer.width, height: outer.height };
    const division = (0, arrangement_layout_1.activeDivision)({ size, origin, regions });
    const automatic = splitAxis(arrangement, size, division, sizeClass.horizontal === 'regular');
    const axis = division ? division.axis : forced === 'never' ? null : forced === 'always' ? (automatic ?? (size.width >= size.height ? 'horizontal' : 'vertical')) : automatic;
    const whole = { x: 0, y: 0, width: size.width, height: size.height };
    const rtl = react_native_1.I18nManager.isRTL;
    const sidebar = arrangement === 'list-detail' && axis === 'horizontal' && !division;
    const [leadingFrame, trailingFrame] = !axis
        ? [whole, whole]
        : sidebar
            ? sidebarParts(size, sidebarWidth(size.width, { fraction: leadingFraction, min: minLeadingWidth, max: maxLeadingWidth }), rtl)
            : (0, arrangement_layout_1.splitParts)(size, axis, division, rtl);
    const split = axis !== null;
    const onePane = !split && arrangement === 'list-detail';
    const trailingHidden = onePane && compact === 'leading';
    const leadingHidden = onePane && compact === 'trailing';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { ref: ref, testID: testID, style: [styles.fill, style], onLayout: onLayout, children: [(0, jsx_runtime_1.jsx)(PaneProvider, { pane: { split, side: split ? 'leading' : 'only', x: origin.x + leadingFrame.x, y: origin.y + leadingFrame.y, width: leadingFrame.width, height: leadingFrame.height, hidden: leadingHidden }, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { testID: exports.PANE_LEADING_TESTID, style: [styles.pane, leadingStyle, (0, measure_1.placedFrame)(leadingFrame), leadingHidden && styles.hidden], children: leading }) }), (0, jsx_runtime_1.jsx)(PaneProvider, { pane: { split, side: split ? 'trailing' : 'only', x: origin.x + trailingFrame.x, y: origin.y + trailingFrame.y, width: trailingFrame.width, height: trailingFrame.height, hidden: trailingHidden }, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { testID: exports.PANE_TRAILING_TESTID, style: [styles.pane, trailingStyle, (0, measure_1.placedFrame)(trailingFrame), trailingHidden && styles.hidden], pointerEvents: split ? 'auto' : 'box-none', children: trailing }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    fill: { flex: 1 },
    pane: { overflow: 'hidden' },
    hidden: { display: 'none' },
});
/** Whether two contents have room to share this pane: a regular width, or an active fold crossing it. */
function useSplitWindow() {
    const { sizeClass, regions } = (0, context_1.useDuo)();
    const { x, y, width, height } = usePane();
    return sizeClass.horizontal === 'regular' || (0, arrangement_layout_1.activeDivision)({ size: { width, height }, origin: { x, y }, regions }) !== null;
}
//# sourceMappingURL=pane.js.map