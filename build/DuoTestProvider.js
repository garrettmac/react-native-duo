"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuoTestProvider = DuoTestProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Renders children as if the app were in one pose, with no native view: for jest, screenshots and in-app previews.
 * Like `DuoProvider` it wraps children in a root view, so region frames are measured from it.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
const poses_1 = require("./poses");
function DuoTestProvider({ pose, cameras, children }) {
    const rootRef = (0, react_1.useRef)(null);
    const resolved = typeof pose === 'string' ? poses_1.poses[pose] : pose;
    const value = (0, react_1.useMemo)(() => ({
        ...(0, context_1.fixedContext)({
            sizeClass: resolved.sizeClass,
            verticalBarEdge: resolved.verticalBarEdge,
            regions: resolved.regions,
            window: resolved.window,
            source: 'native',
        }, cameras),
        rootRef,
    }), [resolved, cameras]);
    return ((0, jsx_runtime_1.jsx)(context_1.DuoContext.Provider, { value: value, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { ref: rootRef, style: styles.root, children: children }) }));
}
const styles = react_native_1.StyleSheet.create({ root: { flex: 1 } });
//# sourceMappingURL=DuoTestProvider.js.map