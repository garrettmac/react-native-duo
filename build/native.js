"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUO_NATIVE_VIEW = exports.DUO_NATIVE_MODULE = void 0;
exports.loadObserverView = loadObserverView;
/**
 * The native observer view, when this binary has it. `DuoProvider` resolves it once per mount. Expo Go, jest, web and a build made before the module was
 * added have no view; `DuoObserverView` is then null and the provider reads the window instead.
 */
const expo_1 = require("expo");
exports.DUO_NATIVE_MODULE = 'ReactNativeDuo';
exports.DUO_NATIVE_VIEW = 'DuoObserverView';
function loadObserverView() {
    if ((0, expo_1.requireOptionalNativeModule)(exports.DUO_NATIVE_MODULE) === null)
        return null;
    try {
        return (0, expo_1.requireNativeView)(exports.DUO_NATIVE_MODULE, exports.DUO_NATIVE_VIEW);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=native.js.map