/**
 * Test poses: what the observer reports in each way a person can hold an iPhone Duo, plus a phone and an iPad.
 * The split-half poses are the app in one half of a 50/50 split of the inner display; the pip pose is the inner
 * display with a pinned video taking the top half, so the app's window is the bottom half.
 * The sizes, hinge frames and camera frames are fixtures chosen for tests, not Apple's published points; Apple
 * publishes none.
 */
import type { DuoSnapshot, WindowSize } from './types';
export type PoseName = 'closed' | 'closedLandscape' | 'openPortrait' | 'openLandscape' | 'partlyFolded' | 'partlyFoldedTabletop' | 'splitHalfLeading' | 'splitHalfTrailing' | 'pipPinned' | 'iPad' | 'phone';
export interface Pose extends DuoSnapshot {
    name: PoseName;
    window: WindowSize;
}
export declare const poses: Readonly<Record<PoseName, Pose>>;
export declare const POSE_NAMES: PoseName[];
