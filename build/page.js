"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUO_PAGE_CONTENT_TESTID = exports.DUO_PAGE_STRIP_TESTID = exports.DUO_PAGE_TESTID = exports.touchesEdge = void 0;
exports.pageMode = pageMode;
exports.usePage = usePage;
exports.DuoPage = DuoPage;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * A screen's bars, wherever the pose puts them. On a phone, an iPad or any window the system keeps bars horizontal,
 * `DuoPage` is a plain column: the top bar, the content, the bottom bar, exactly as you pass them. Where the system
 * stands bars on the side (the closed iPhone Duo, open in landscape, the pane against the window's edge), the same
 * bars move into one vertical strip on that edge: the top bar's controls at the top, the bottom bar's at the bottom.
 * A page inside a pane that does not touch the edge keeps its bars horizontal at the top of its pane, and a page
 * inside a pane that does gives its bars to the strip of the page around it, so a window has one strip per edge.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const clearance_1 = require("./clearance");
const context_1 = require("./context");
const measure_1 = require("./measure");
const page_context_1 = require("./page-context");
Object.defineProperty(exports, "touchesEdge", { enumerable: true, get: function () { return page_context_1.touchesEdge; } });
const pane_1 = require("./pane");
const HostContext = (0, react_1.createContext)(null);
exports.DUO_PAGE_TESTID = 'duo-page';
exports.DUO_PAGE_STRIP_TESTID = 'duo-page-strip';
exports.DUO_PAGE_CONTENT_TESTID = 'duo-page-content';
/** The decision `DuoPage` makes: hand bars to the strip around it, stand its own, or keep them in place. */
function pageMode({ edge, pane, window, host, rtl }) {
    if (host)
        return (0, page_context_1.touchesEdge)(pane, host.frame, host.edge, rtl) ? 'hosted' : 'horizontal';
    if (edge !== null && (0, page_context_1.touchesEdge)(pane, window, edge, rtl))
        return 'side';
    return 'horizontal';
}
function wrap(node, style) {
    return style && node !== null ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: style, children: node }) : node;
}
function draw(slot, placement) {
    return typeof slot === 'function' ? slot(placement) : (slot ?? null);
}
/** Where the page this component is in draws its bars. Draw the title in the content when `vertical`. */
function usePage() {
    return (0, react_1.useContext)(page_context_1.PageContext) ?? HORIZONTAL;
}
const HORIZONTAL = { mode: 'horizontal', vertical: false, edge: null };
function DuoPage({ children, topBar, bottomBar, sideTopBar, sideBottomBar, style, sideStyle, contentStyle, topBarStyle, bottomBarStyle, sideInsetTop, sideInsetBottom, renderSide, mode: forced = 'auto', shareSide = true, onModeChange, testID = exports.DUO_PAGE_TESTID, }) {
    const outerHost = (0, react_1.useContext)(HostContext);
    const host = shareSide ? outerHost : null;
    const state = (0, context_1.useDuo)();
    const pane = (0, pane_1.usePane)();
    const rtl = react_native_1.I18nManager.isRTL;
    const window = { x: 0, y: 0, width: state.window.width, height: state.window.height };
    // A page that keeps its bars out of the strip around it sits beside that strip, so it never stands its own: deciding
    // from its frame instead flips it to `side` for a frame while the frame is stale after a pose change, remounting its bars.
    const automatic = pane.hidden || (outerHost && !shareSide) ? 'horizontal' : pageMode({ edge: state.verticalBarEdge, pane, window, host, rtl });
    const mode = forced === 'auto' ? automatic : forced === 'horizontal' ? 'horizontal' : automatic === 'hosted' ? 'hosted' : 'side';
    const edge = mode === 'side' ? (state.verticalBarEdge ?? 'trailing') : mode === 'hosted' ? host.edge : null;
    const vertical = mode !== 'horizontal';
    const placement = (0, react_1.useMemo)(() => ({ mode, vertical, edge }), [mode, vertical, edge]);
    const sideTop = draw(sideTopBar ?? topBar, { position: 'side', vertical: true, edge });
    const sideBottom = draw(sideBottomBar ?? bottomBar, { position: 'side', vertical: true, edge });
    (0, react_1.useEffect)(() => {
        onModeChange?.(mode);
    }, [mode, onModeChange]);
    const id = (0, react_1.useId)();
    (0, react_1.useEffect)(() => {
        if (mode !== 'hosted' || !host)
            return;
        host.contribute(id, { top: sideTop, bottom: sideBottom });
    });
    (0, react_1.useEffect)(() => {
        if (mode !== 'hosted' || !host)
            return;
        return () => host.contribute(id, null);
    }, [mode, host, id]);
    const [contributions, setContributions] = (0, react_1.useState)(new Map());
    const contribute = (0, react_1.useMemo)(() => (id, contribution) => setContributions(previous => {
        const next = new Map(previous);
        if (contribution)
            next.set(id, contribution);
        else
            next.delete(id);
        return next;
    }), []);
    const clearance = (0, clearance_1.useCameraClearance)();
    // One tree in every mode, so the content keeps its place (and its state) when the pose moves the bars.
    let before = null;
    let after = null;
    if (mode === 'horizontal') {
        before = wrap(draw(topBar, { position: 'top', vertical: false, edge: null }), topBarStyle);
        after = wrap(draw(bottomBar, { position: 'bottom', vertical: false, edge: null }), bottomBarStyle);
    }
    else if (mode === 'side') {
        const hosted = [...contributions.entries()];
        const parts = {
            edge: edge,
            top: [...hosted.map(([key, contribution]) => (0, jsx_runtime_1.jsx)(react_native_1.View, { children: contribution.top }, key)), (0, jsx_runtime_1.jsx)(react_native_1.View, { children: sideTop }, "own")],
            bottom: [...hosted.map(([key, contribution]) => (0, jsx_runtime_1.jsx)(react_native_1.View, { children: contribution.bottom }, key)), (0, jsx_runtime_1.jsx)(react_native_1.View, { children: sideBottom }, "own")],
            insetTop: sideInsetTop ?? clearance.top,
            insetBottom: sideInsetBottom ?? clearance.bottom,
        };
        const strip = renderSide ? (renderSide(parts)) : ((0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: exports.DUO_PAGE_STRIP_TESTID, style: [styles.strip, { paddingTop: parts.insetTop }, sideStyle, parts.insetBottom > 0 && { paddingBottom: parts.insetBottom }], children: [parts.top, (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.fill }), parts.bottom] }));
        if (edge === 'leading')
            before = strip;
        else
            after = strip;
    }
    return ((0, jsx_runtime_1.jsx)(page_context_1.PageContext.Provider, { value: placement, children: (0, jsx_runtime_1.jsx)(StripContext.Provider, { value: mode === 'side' ? contribute : null, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: testID, style: [mode === 'side' ? styles.row : styles.column, style], children: [(0, jsx_runtime_1.jsx)(react_1.Fragment, { children: before }, "before"), (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: (0, jsx_runtime_1.jsx)(Content, { pane: pane, style: contentStyle, host: mode === 'side' && edge ? edge : null, hostFrame: host && mode === 'hosted' ? host : null, children: children }) }, "content"), (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: after }, "after")] }) }) }));
}
const StripContext = (0, react_1.createContext)(null);
function Content({ pane, style, host, hostFrame, children }) {
    const { ref, onLayout, size, origin } = (0, measure_1.useArrangementBox)();
    const contribute = (0, react_1.useContext)(StripContext);
    const inner = size ? { ...pane, x: origin.x, y: origin.y, width: size.width, height: size.height } : pane;
    const nextHost = (0, react_1.useMemo)(() => {
        if (hostFrame)
            return hostFrame;
        if (host && contribute)
            return { edge: host, frame: { x: inner.x, y: inner.y, width: inner.width, height: inner.height }, contribute };
        return null;
    }, [hostFrame, host, contribute, inner.x, inner.y, inner.width, inner.height]);
    return ((0, jsx_runtime_1.jsx)(HostContext.Provider, { value: nextHost, children: (0, jsx_runtime_1.jsx)(pane_1.PaneProvider, { pane: inner, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { ref: ref, onLayout: onLayout, testID: exports.DUO_PAGE_CONTENT_TESTID, style: [styles.fill, style], children: children }) }) }));
}
const styles = react_native_1.StyleSheet.create({
    fill: { flex: 1 },
    column: { flex: 1 },
    row: { flex: 1, flexDirection: 'row' },
    strip: { alignItems: 'center' },
});
//# sourceMappingURL=page.js.map