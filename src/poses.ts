/**
 * Test poses: what the observer reports in each way a person can hold an iPhone Duo, plus a phone and an iPad.
 * The split-half poses are the app in one half of a 50/50 split of the inner display; the pip pose is the inner
 * display with a pinned video taking the top half, so the app's window is the bottom half.
 * The sizes, hinge frames and camera frames are fixtures chosen for tests, not Apple's published points; Apple
 * publishes none.
 */
import type {DuoSnapshot, Insets, Rect, ReservedRegion, WindowSize} from './types';

export type PoseName =
  | 'closed'
  | 'closedLandscape'
  | 'openPortrait'
  | 'openLandscape'
  | 'partlyFolded'
  | 'partlyFoldedTabletop'
  | 'splitHalfLeading'
  | 'splitHalfTrailing'
  | 'pipPinned'
  | 'iPad'
  | 'phone';

export interface Pose extends DuoSnapshot {
  name: PoseName;
  window: WindowSize;
}

const NO_MARGINS: Insets = {top: 0, left: 0, bottom: 0, right: 0};

function division(frame: Rect, margins: Insets, isActive: boolean): ReservedRegion {
  return {kind: 'division', frame, margins, isActive};
}

function occlusion(frame: Rect, isActive: boolean): ReservedRegion {
  return {kind: 'occlusion', frame, margins: {top: 8, left: 8, bottom: 8, right: 8}, isActive};
}

const SIDE_HINGE_MARGINS: Insets = {top: 0, left: 10, bottom: 0, right: 10};
const FLAT_HINGE_MARGINS: Insets = {top: 10, left: 0, bottom: 10, right: 0};

export const poses: Readonly<Record<PoseName, Pose>> = Object.freeze({
  phone: {
    name: 'phone',
    window: {width: 390, height: 844},
    sizeClass: {horizontal: 'compact', vertical: 'regular'},
    verticalBarEdge: null,
    regions: [],
  },
  iPad: {
    name: 'iPad',
    window: {width: 1024, height: 1366},
    sizeClass: {horizontal: 'regular', vertical: 'regular'},
    verticalBarEdge: null,
    regions: [],
  },
  closed: {
    name: 'closed',
    window: {width: 460, height: 700},
    sizeClass: {horizontal: 'compact', vertical: 'regular'},
    verticalBarEdge: 'trailing',
    regions: [occlusion({x: 400, y: 12, width: 44, height: 44}, true)],
  },
  closedLandscape: {
    name: 'closedLandscape',
    window: {width: 700, height: 460},
    sizeClass: {horizontal: 'compact', vertical: 'compact'},
    verticalBarEdge: 'trailing',
    regions: [occlusion({x: 644, y: 404, width: 44, height: 44}, true)],
  },
  openPortrait: {
    name: 'openPortrait',
    window: {width: 951, height: 1100},
    sizeClass: {horizontal: 'regular', vertical: 'regular'},
    verticalBarEdge: null,
    regions: [
      division({x: 0, y: 530, width: 951, height: 40}, FLAT_HINGE_MARGINS, false),
      occlusion({x: 455, y: 0, width: 40, height: 40}, false),
    ],
  },
  openLandscape: {
    name: 'openLandscape',
    window: {width: 1100, height: 951},
    sizeClass: {horizontal: 'regular', vertical: 'regular'},
    verticalBarEdge: 'trailing',
    regions: [
      division({x: 530, y: 0, width: 40, height: 951}, SIDE_HINGE_MARGINS, false),
      occlusion({x: 740, y: 12, width: 44, height: 44}, true),
    ],
  },
  partlyFolded: {
    name: 'partlyFolded',
    window: {width: 1100, height: 951},
    sizeClass: {horizontal: 'regular', vertical: 'regular'},
    verticalBarEdge: 'trailing',
    regions: [
      division({x: 530, y: 0, width: 40, height: 951}, SIDE_HINGE_MARGINS, true),
      occlusion({x: 740, y: 12, width: 44, height: 44}, true),
    ],
  },
  partlyFoldedTabletop: {
    name: 'partlyFoldedTabletop',
    window: {width: 951, height: 1100},
    sizeClass: {horizontal: 'regular', vertical: 'regular'},
    verticalBarEdge: null,
    regions: [
      division({x: 0, y: 530, width: 951, height: 40}, FLAT_HINGE_MARGINS, true),
      occlusion({x: 455, y: 0, width: 40, height: 40}, false),
    ],
  },
  splitHalfLeading: {
    name: 'splitHalfLeading',
    window: {width: 530, height: 951},
    sizeClass: {horizontal: 'compact', vertical: 'regular'},
    verticalBarEdge: 'leading',
    regions: [],
  },
  splitHalfTrailing: {
    name: 'splitHalfTrailing',
    window: {width: 530, height: 951},
    sizeClass: {horizontal: 'compact', vertical: 'regular'},
    verticalBarEdge: 'trailing',
    regions: [],
  },
  pipPinned: {
    name: 'pipPinned',
    window: {width: 1100, height: 476},
    sizeClass: {horizontal: 'regular', vertical: 'compact'},
    verticalBarEdge: 'trailing',
    regions: [division({x: 530, y: 0, width: 40, height: 476}, SIDE_HINGE_MARGINS, false)],
  },
});

export const POSE_NAMES = Object.keys(poses) as PoseName[];
