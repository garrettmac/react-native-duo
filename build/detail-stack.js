"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAIL_STACK_TESTID = void 0;
exports.useDetailStack = useDetailStack;
exports.detailShowsBack = detailShowsBack;
exports.DetailStack = DetailStack;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * The trailing pane's own navigation, the way a split view keeps it. The list stays in the leading pane; the item it
 * opened, and anything you open from there, stack in the trailing pane. Back pops within the stack; on the first
 * screen it leaves the detail (`onExit`), which on a phone or the closed iPhone Duo returns to the list. Every screen
 * stays mounted under the one on top, so folding and unfolding keep scroll and typed text.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const pane_1 = require("./pane");
const NO_STACK = { depth: 1, push: () => { }, back: () => { }, popToRoot: () => { }, showBack: false, besideList: false };
const DetailStackContext = (0, react_1.createContext)(NO_STACK);
exports.DETAIL_STACK_TESTID = 'duo-detail-stack';
/** The detail stack this screen is in; outside one, a single screen with no Back. */
function useDetailStack() {
    return (0, react_1.useContext)(DetailStackContext);
}
/** Whether a stack screen at `depth` shows Back: always below the first, and on the first only without the list beside it. */
function detailShowsBack(depth, besideList) {
    return depth > 1 || !besideList;
}
let nextKey = 0;
function DetailStack({ children, onExit, screenStyle, showBackOnRoot, renderStack, testID = exports.DETAIL_STACK_TESTID }) {
    const [pushed, setPushed] = (0, react_1.useState)([]);
    const pane = (0, pane_1.usePane)();
    const besideList = pane.split;
    const push = (0, react_1.useCallback)((element, key) => setPushed(previous => [...previous, { key: key ?? `screen-${nextKey++}`, element }]), []);
    const back = (0, react_1.useCallback)(() => {
        if (pushed.length > 0)
            setPushed(previous => previous.slice(0, -1));
        else
            onExit?.();
    }, [pushed.length, onExit]);
    const popToRoot = (0, react_1.useCallback)(() => setPushed([]), []);
    const depth = pushed.length + 1;
    const showBack = depth === 1 && showBackOnRoot !== undefined ? showBackOnRoot : detailShowsBack(depth, besideList);
    const value = (0, react_1.useMemo)(() => ({ depth, push, back, popToRoot, showBack, besideList }), [depth, push, back, popToRoot, showBack, besideList]);
    const screens = [{ key: 'root', element: children }, ...pushed].map((screen, index, all) => ({
        key: screen.key,
        element: (0, jsx_runtime_1.jsx)(pane_1.PaneProvider, { pane: index < all.length - 1 ? { ...pane, hidden: true } : pane, children: screen.element }),
    }));
    const top = screens.length - 1;
    return ((0, jsx_runtime_1.jsx)(DetailStackContext.Provider, { value: value, children: renderStack ? (renderStack(screens, top)) : ((0, jsx_runtime_1.jsx)(react_native_1.View, { testID: testID, style: styles.fill, children: screens.map((screen, index) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.fill, screenStyle, index < top && styles.hidden], children: screen.element }, screen.key))) })) }));
}
const styles = react_native_1.StyleSheet.create({
    fill: { flex: 1 },
    hidden: { display: 'none' },
});
//# sourceMappingURL=detail-stack.js.map