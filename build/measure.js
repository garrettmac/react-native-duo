"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placedFrame = placedFrame;
exports.useArrangementBox = useArrangementBox;
/** The size a container laid out at, where it sits in the provider's root view (which region frames are in), and how to place a frame back in it. */
const react_1 = require("react");
const react_native_1 = require("react-native");
const context_1 = require("./context");
/** A frame in physical points as an absolute style; React Native reads `right` as the left edge when it swaps sides in a right-to-left layout. */
function placedFrame(frame) {
    const swapped = react_native_1.I18nManager.isRTL && react_native_1.I18nManager.getConstants().doLeftAndRightSwapInRTL;
    const horizontal = swapped ? { right: frame.x } : { left: frame.x };
    return { position: 'absolute', ...horizontal, top: frame.y, width: frame.width, height: frame.height };
}
let warned = false;
function warnOnce() {
    if (warned)
        return;
    warned = true;
    console.warn('react-native-duo: could not measure a view against the DuoProvider root (is it in a separate native modal?); regions are not applied to it');
}
function useArrangementBox() {
    const { rootRef } = (0, context_1.useDuoContext)();
    const ref = (0, react_1.useRef)(null);
    const [size, setSize] = (0, react_1.useState)(null);
    const [origin, setOrigin] = (0, react_1.useState)({ x: 0, y: 0 });
    const onLayout = (0, react_1.useCallback)((event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize(previous => (previous && previous.width === width && previous.height === height ? previous : { width, height }));
        const root = rootRef?.current;
        if (!root)
            return;
        ref.current?.measureLayout(root, (x, y) => setOrigin(previous => (previous.x === x && previous.y === y ? previous : { x, y })), warnOnce);
    }, [rootRef]);
    return { ref, onLayout, size, origin };
}
//# sourceMappingURL=measure.js.map