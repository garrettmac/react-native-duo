"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuoProvider = DuoProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Mounts the native observer once, filling the root, and shares what it reports. Without the native view it shares
 * the window size, no regions and a null edge, and says so through `useDuo().source`.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
const native_1 = require("./native");
const snapshot_1 = require("./snapshot");
function DuoProvider({ children }) {
    const { width, height } = (0, react_native_1.useWindowDimensions)();
    const rootRef = (0, react_1.useRef)(null);
    const [ObserverView] = (0, react_1.useState)(native_1.loadObserverView);
    const [snapshot, setSnapshot] = (0, react_1.useState)(null);
    const [cameras, setCameras] = (0, react_1.useState)(context_1.NO_CAMERAS);
    const [cameraWatchers, setCameraWatchers] = (0, react_1.useState)(0);
    const onDuoChange = (0, react_1.useCallback)((event) => {
        const parsed = (0, snapshot_1.parseSnapshot)(event.nativeEvent);
        if (parsed === null) {
            console.warn('react-native-duo: ignored a malformed onDuoChange payload from the native observer');
            return;
        }
        setSnapshot(parsed);
    }, []);
    const onCameraDirections = (0, react_1.useCallback)((event) => {
        const parsed = (0, snapshot_1.parseCameraDirections)(event.nativeEvent);
        if (parsed === null) {
            console.warn('react-native-duo: ignored a malformed onCameraDirections payload from the native observer');
            return;
        }
        setCameras(parsed);
    }, []);
    const watchCameras = (0, react_1.useCallback)(() => {
        setCameraWatchers(count => count + 1);
        return () => setCameraWatchers(count => count - 1);
    }, []);
    const value = (0, react_1.useMemo)(() => {
        const window = { width, height };
        const state = snapshot === null ? (0, context_1.windowState)(window) : { ...snapshot, window, source: 'native' };
        return { state, rootRef, cameras: cameraWatchers > 0 ? cameras : context_1.NO_CAMERAS, watchCameras };
    }, [snapshot, width, height, cameras, cameraWatchers, watchCameras]);
    return ((0, jsx_runtime_1.jsx)(context_1.DuoContext.Provider, { value: value, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { ref: rootRef, style: styles.root, children: [ObserverView === null ? null : ((0, jsx_runtime_1.jsx)(ObserverView, { pointerEvents: "none", style: react_native_1.StyleSheet.absoluteFill, observeCameras: cameraWatchers > 0, onDuoChange: onDuoChange, onCameraDirections: onCameraDirections })), children] }) }));
}
const styles = react_native_1.StyleSheet.create({ root: { flex: 1 } });
//# sourceMappingURL=DuoProvider.js.map