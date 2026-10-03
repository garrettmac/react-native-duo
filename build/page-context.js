"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageContext = void 0;
exports.touchesEdge = touchesEdge;
exports.usePaneBarEdge = usePaneBarEdge;
/** Which edge, if any, a pane's bars stand on: shared by `DuoPage`, `useVerticalBar` and `useBarInsets`. */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
const pane_1 = require("./pane");
exports.PageContext = (0, react_1.createContext)(null);
const TOLERANCE = 1;
/** Whether `box` reaches the top of `within` and its side on `edge`, in physical points (right to left aware). */
function touchesEdge(box, within, edge, rtl) {
    if (box.y > within.y + TOLERANCE)
        return false;
    const right = (edge === 'trailing') !== rtl;
    return right ? box.x + box.width >= within.x + within.width - TOLERANCE : box.x <= within.x + TOLERANCE;
}
/**
 * The edge this pane's bars stand on: the page's, inside a `DuoPage`; otherwise the system's edge when the pane
 * reaches the top of the window and that side of it, and none for a pane elsewhere (the list beside a detail).
 */
function usePaneBarEdge() {
    const page = (0, react_1.useContext)(exports.PageContext);
    const { verticalBarEdge, window } = (0, context_1.useDuo)();
    const pane = (0, pane_1.usePane)();
    if (page)
        return page.edge;
    if (verticalBarEdge === null)
        return null;
    return touchesEdge(pane, { x: 0, y: 0, width: window.width, height: window.height }, verticalBarEdge, react_native_1.I18nManager.isRTL) ? verticalBarEdge : null;
}
//# sourceMappingURL=page-context.js.map