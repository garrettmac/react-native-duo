"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUO_OVERLAY_TESTID = void 0;
exports.DuoOverlayHost = DuoOverlayHost;
exports.DuoOverlay = DuoOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * A layer above the page for what covers the whole window, such as a custom sheet. Mounted where it is opened, a
 * sheet sits inside `DuoPage`'s content, and the side strip, drawn after the content, covers the controls the sheet
 * stands on the same edge. `DuoOverlay` draws its children in the nearest `DuoOverlayHost` instead, after everything
 * the host wraps, while staying in the React tree (so it stays inside a simulated device frame, unlike a `Modal`).
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
exports.DUO_OVERLAY_TESTID = 'duo-overlay';
const OverlayContext = (0, react_1.createContext)(null);
/**
 * Wrap the app's screens in one, inside `DuoProvider`. Overlays read context from here, not from where they are
 * opened: put providers they need above the host.
 */
function DuoOverlayHost({ children }) {
    const [layers, setLayers] = (0, react_1.useState)([]);
    const [place] = (0, react_1.useState)(() => (id, node) => setLayers(current => {
        if (node === null)
            return current.filter(([key]) => key !== id);
        const at = current.findIndex(([key]) => key === id);
        return at === -1 ? [...current, [id, node]] : current.map((layer, index) => (index === at ? [id, node] : layer));
    }));
    return ((0, jsx_runtime_1.jsxs)(OverlayContext.Provider, { value: place, children: [children, layers.length > 0 ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { testID: exports.DUO_OVERLAY_TESTID, pointerEvents: "box-none", style: react_native_1.StyleSheet.absoluteFill, children: layers.map(([id, node]) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { pointerEvents: "box-none", style: react_native_1.StyleSheet.absoluteFill, children: node }, id))) })) : null] }));
}
/** Draws its children above the page, in the nearest `DuoOverlayHost`. Without one it throws. */
function DuoOverlay({ children }) {
    const place = (0, react_1.useContext)(OverlayContext);
    if (place === null)
        throw new Error('DuoOverlay needs a DuoOverlayHost above it.');
    const id = (0, react_1.useId)();
    (0, react_1.useLayoutEffect)(() => {
        place(id, children);
    }, [place, id, children]);
    (0, react_1.useLayoutEffect)(() => () => place(id, null), [place, id]);
    return null;
}
//# sourceMappingURL=overlay.js.map