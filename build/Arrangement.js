"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARRANGEMENT_SECONDARY_TESTID = exports.ARRANGEMENT_PRIMARY_TESTID = exports.ARRANGEMENT_TESTID = void 0;
exports.Arrangement = Arrangement;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Apple's arrangement view in JS: two views placed around an active division. Both stay mounted in every pose so
 * folding and unfolding keep their state. Keep navigation outside an arrangement, and do not put one inside a
 * scroll view or a list.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const arrangement_layout_1 = require("./arrangement-layout");
const context_1 = require("./context");
const measure_1 = require("./measure");
const pane_1 = require("./pane");
exports.ARRANGEMENT_TESTID = 'duo-arrangement';
exports.ARRANGEMENT_PRIMARY_TESTID = 'duo-arrangement-primary';
exports.ARRANGEMENT_SECONDARY_TESTID = 'duo-arrangement-secondary';
const BOTH_AXES = ['horizontal', 'vertical'];
function asList(axes) {
    return typeof axes === 'string' ? [axes] : axes;
}
function paneOf({ frame, isHidden, splitAxis }, side, origin) {
    const split = splitAxis !== null;
    return { split, side: split ? side : 'only', x: origin.x + frame.x, y: origin.y + frame.y, width: frame.width, height: frame.height, hidden: isHidden };
}
function placedStyle({ frame, isHidden, zIndex }) {
    return { ...(0, measure_1.placedFrame)(frame), zIndex, display: isHidden ? 'none' : 'flex' };
}
function Arrangement({ kind, axes = BOTH_AXES, collapsed = false, primary, secondary, style, testID = exports.ARRANGEMENT_TESTID }) {
    const { state } = (0, context_1.useDuoContext)();
    const { ref, onLayout, size: box, origin } = (0, measure_1.useArrangementBox)();
    const size = box ?? state.window;
    const axisList = asList(axes);
    const layout = (0, react_1.useMemo)(() => (0, arrangement_layout_1.arrangementLayout)({ kind, axes: axisList, size, origin, regions: state.regions, rtl: react_native_1.I18nManager.isRTL, collapsed }), [kind, axisList, collapsed, size, origin, state.regions]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { ref: ref, testID: testID, style: [styles.container, style], onLayout: onLayout, children: [(0, jsx_runtime_1.jsx)(pane_1.PaneProvider, { pane: paneOf(layout.secondary, kind === 'overlay' ? 'leading' : 'trailing', origin), children: (0, jsx_runtime_1.jsx)(react_native_1.View, { testID: exports.ARRANGEMENT_SECONDARY_TESTID, style: placedStyle(layout.secondary), children: secondary }) }), (0, jsx_runtime_1.jsx)(pane_1.PaneProvider, { pane: paneOf(layout.primary, kind === 'overlay' ? 'trailing' : 'leading', origin), children: (0, jsx_runtime_1.jsx)(react_native_1.View, { testID: exports.ARRANGEMENT_PRIMARY_TESTID, style: placedStyle(layout.primary), children: primary }) })] }));
}
const styles = react_native_1.StyleSheet.create({ container: { flex: 1 } });
//# sourceMappingURL=Arrangement.js.map