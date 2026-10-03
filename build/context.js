"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuoContext = exports.NO_CAMERAS = void 0;
exports.windowState = windowState;
exports.useDuoContext = useDuoContext;
exports.useDuo = useDuo;
exports.fixedContext = fixedContext;
/** The one context every hook and `Arrangement` reads: the provider's state and the root view regions are measured from. */
const react_1 = require("react");
const react_native_1 = require("react-native");
const sizes_1 = require("./sizes");
exports.NO_CAMERAS = Object.freeze({ forward: [], backward: [], source: 'unavailable' });
const unwatched = () => () => { };
exports.DuoContext = (0, react_1.createContext)(null);
function windowState(window) {
    return { sizeClass: (0, sizes_1.sizeClassFromWindow)(window), verticalBarEdge: null, regions: [], window, source: 'window' };
}
function useDuoContext() {
    const placed = (0, react_1.useContext)(exports.DuoContext);
    const { width, height } = (0, react_native_1.useWindowDimensions)();
    const fallback = (0, react_1.useMemo)(() => ({ state: windowState({ width, height }), rootRef: null, cameras: exports.NO_CAMERAS, watchCameras: unwatched }), [width, height]);
    return placed ?? fallback;
}
/** Everything the provider knows. Outside a provider it is the window with no regions and no bar edge. */
function useDuo() {
    return useDuoContext().state;
}
/** Starts a context value for a fixed state: the test provider's. */
function fixedContext(state, cameras = exports.NO_CAMERAS) {
    return { state, rootRef: null, cameras, watchCameras: unwatched };
}
//# sourceMappingURL=context.js.map