"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGULAR_HEIGHT_MIN_DP = exports.REGULAR_WIDTH_MIN_DP = void 0;
exports.sizeClassFromWindow = sizeClassFromWindow;
exports.REGULAR_WIDTH_MIN_DP = 600;
exports.REGULAR_HEIGHT_MIN_DP = 480;
function sizeClassFromWindow({ width, height }) {
    return {
        horizontal: width >= exports.REGULAR_WIDTH_MIN_DP ? 'regular' : 'compact',
        vertical: height >= exports.REGULAR_HEIGHT_MIN_DP ? 'regular' : 'compact',
    };
}
//# sourceMappingURL=sizes.js.map