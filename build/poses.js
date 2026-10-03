"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSE_NAMES = exports.poses = void 0;
const NO_MARGINS = { top: 0, left: 0, bottom: 0, right: 0 };
function division(frame, margins, isActive) {
    return { kind: 'division', frame, margins, isActive };
}
function occlusion(frame, isActive) {
    return { kind: 'occlusion', frame, margins: { top: 8, left: 8, bottom: 8, right: 8 }, isActive };
}
const SIDE_HINGE_MARGINS = { top: 0, left: 10, bottom: 0, right: 10 };
const FLAT_HINGE_MARGINS = { top: 10, left: 0, bottom: 10, right: 0 };
exports.poses = Object.freeze({
    phone: {
        name: 'phone',
        window: { width: 390, height: 844 },
        sizeClass: { horizontal: 'compact', vertical: 'regular' },
        verticalBarEdge: null,
        regions: [],
    },
    iPad: {
        name: 'iPad',
        window: { width: 1024, height: 1366 },
        sizeClass: { horizontal: 'regular', vertical: 'regular' },
        verticalBarEdge: null,
        regions: [],
    },
    closed: {
        name: 'closed',
        window: { width: 460, height: 700 },
        sizeClass: { horizontal: 'compact', vertical: 'regular' },
        verticalBarEdge: 'trailing',
        regions: [occlusion({ x: 400, y: 12, width: 44, height: 44 }, true)],
    },
    closedLandscape: {
        name: 'closedLandscape',
        window: { width: 700, height: 460 },
        sizeClass: { horizontal: 'compact', vertical: 'compact' },
        verticalBarEdge: 'trailing',
        regions: [occlusion({ x: 644, y: 404, width: 44, height: 44 }, true)],
    },
    openPortrait: {
        name: 'openPortrait',
        window: { width: 951, height: 1100 },
        sizeClass: { horizontal: 'regular', vertical: 'regular' },
        verticalBarEdge: null,
        regions: [
            division({ x: 0, y: 530, width: 951, height: 40 }, FLAT_HINGE_MARGINS, false),
            occlusion({ x: 455, y: 0, width: 40, height: 40 }, false),
        ],
    },
    openLandscape: {
        name: 'openLandscape',
        window: { width: 1100, height: 951 },
        sizeClass: { horizontal: 'regular', vertical: 'regular' },
        verticalBarEdge: 'trailing',
        regions: [
            division({ x: 530, y: 0, width: 40, height: 951 }, SIDE_HINGE_MARGINS, false),
            occlusion({ x: 740, y: 12, width: 44, height: 44 }, true),
        ],
    },
    partlyFolded: {
        name: 'partlyFolded',
        window: { width: 1100, height: 951 },
        sizeClass: { horizontal: 'regular', vertical: 'regular' },
        verticalBarEdge: 'trailing',
        regions: [
            division({ x: 530, y: 0, width: 40, height: 951 }, SIDE_HINGE_MARGINS, true),
            occlusion({ x: 740, y: 12, width: 44, height: 44 }, true),
        ],
    },
    partlyFoldedTabletop: {
        name: 'partlyFoldedTabletop',
        window: { width: 951, height: 1100 },
        sizeClass: { horizontal: 'regular', vertical: 'regular' },
        verticalBarEdge: null,
        regions: [
            division({ x: 0, y: 530, width: 951, height: 40 }, FLAT_HINGE_MARGINS, true),
            occlusion({ x: 455, y: 0, width: 40, height: 40 }, false),
        ],
    },
    splitHalfLeading: {
        name: 'splitHalfLeading',
        window: { width: 530, height: 951 },
        sizeClass: { horizontal: 'compact', vertical: 'regular' },
        verticalBarEdge: 'leading',
        regions: [],
    },
    splitHalfTrailing: {
        name: 'splitHalfTrailing',
        window: { width: 530, height: 951 },
        sizeClass: { horizontal: 'compact', vertical: 'regular' },
        verticalBarEdge: 'trailing',
        regions: [],
    },
    pipPinned: {
        name: 'pipPinned',
        window: { width: 1100, height: 476 },
        sizeClass: { horizontal: 'regular', vertical: 'compact' },
        verticalBarEdge: 'trailing',
        regions: [division({ x: 530, y: 0, width: 40, height: 476 }, SIDE_HINGE_MARGINS, false)],
    },
});
exports.POSE_NAMES = Object.keys(exports.poses);
//# sourceMappingURL=poses.js.map