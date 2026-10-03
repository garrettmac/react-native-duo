import type {Axis, Rect} from '../../types';
import type {PoseName} from '../../poses';

export type AxesKey = 'horizontal' | 'vertical' | 'both';

export const AXES: Record<AxesKey, Axis[]> = {horizontal: ['horizontal'], vertical: ['vertical'], both: ['horizontal', 'vertical']};

export const rect = (x: number, y: number, width: number, height: number): Rect => ({x, y, width, height});

export interface Expected {
  primary: Rect;
  secondary: Rect | 'hidden';
  axis: Axis | null;
  primaryZ: number;
  secondaryZ: number;
}

const WINDOW: Record<PoseName, Rect> = {
  phone: rect(0, 0, 390, 844),
  iPad: rect(0, 0, 1024, 1366),
  closed: rect(0, 0, 460, 700),
  closedLandscape: rect(0, 0, 700, 460),
  openPortrait: rect(0, 0, 951, 1100),
  openLandscape: rect(0, 0, 1100, 951),
  partlyFolded: rect(0, 0, 1100, 951),
  partlyFoldedTabletop: rect(0, 0, 951, 1100),
  splitHalfLeading: rect(0, 0, 530, 951),
  splitHalfTrailing: rect(0, 0, 530, 951),
  pipPinned: rect(0, 0, 1100, 476),
};

const layered = (pose: PoseName): Expected => ({primary: WINDOW[pose], secondary: WINDOW[pose], axis: null, primaryZ: 1, secondaryZ: 0});
const primaryOnly = (pose: PoseName): Expected => ({primary: WINDOW[pose], secondary: 'hidden', axis: null, primaryZ: 0, secondaryZ: 0});
const sides = (primary: Rect, secondary: Rect, axis: Axis): Expected => ({primary, secondary, axis, primaryZ: 0, secondaryZ: 0});

const overlayFolded = {
  horizontal: {primary: rect(570, 0, 530, 951), secondary: rect(0, 0, 530, 951), axis: 'horizontal' as Axis, primaryZ: 1, secondaryZ: 0},
  vertical: {primary: rect(0, 570, 951, 530), secondary: rect(0, 0, 951, 530), axis: 'vertical' as Axis, primaryZ: 1, secondaryZ: 0},
};

export const OVERLAY: Record<PoseName, Record<AxesKey, Expected>> = {
  phone: {horizontal: layered('phone'), vertical: layered('phone'), both: layered('phone')},
  iPad: {horizontal: layered('iPad'), vertical: layered('iPad'), both: layered('iPad')},
  closed: {horizontal: layered('closed'), vertical: layered('closed'), both: layered('closed')},
  closedLandscape: {horizontal: layered('closedLandscape'), vertical: layered('closedLandscape'), both: layered('closedLandscape')},
  openPortrait: {horizontal: layered('openPortrait'), vertical: layered('openPortrait'), both: layered('openPortrait')},
  openLandscape: {horizontal: layered('openLandscape'), vertical: layered('openLandscape'), both: layered('openLandscape')},
  partlyFolded: {horizontal: overlayFolded.horizontal, vertical: layered('partlyFolded'), both: overlayFolded.horizontal},
  partlyFoldedTabletop: {horizontal: layered('partlyFoldedTabletop'), vertical: overlayFolded.vertical, both: overlayFolded.vertical},
  splitHalfLeading: {horizontal: layered('splitHalfLeading'), vertical: layered('splitHalfLeading'), both: layered('splitHalfLeading')},
  splitHalfTrailing: {horizontal: layered('splitHalfTrailing'), vertical: layered('splitHalfTrailing'), both: layered('splitHalfTrailing')},
  pipPinned: {horizontal: layered('pipPinned'), vertical: layered('pipPinned'), both: layered('pipPinned')},
};

const stacked = (pose: PoseName, primary: Rect, secondary: Rect): Record<AxesKey, Expected> => ({
  horizontal: primaryOnly(pose),
  vertical: sides(primary, secondary, 'vertical'),
  both: sides(primary, secondary, 'vertical'),
});

const sideBySide = (pose: PoseName, primary: Rect, secondary: Rect): Record<AxesKey, Expected> => ({
  horizontal: sides(primary, secondary, 'horizontal'),
  vertical: primaryOnly(pose),
  both: sides(primary, secondary, 'horizontal'),
});

export const SPLIT: Record<PoseName, Record<AxesKey, Expected>> = {
  phone: stacked('phone', rect(0, 0, 390, 422), rect(0, 422, 390, 422)),
  iPad: stacked('iPad', rect(0, 0, 1024, 683), rect(0, 683, 1024, 683)),
  closed: stacked('closed', rect(0, 0, 460, 350), rect(0, 350, 460, 350)),
  closedLandscape: sideBySide('closedLandscape', rect(0, 0, 350, 460), rect(350, 0, 350, 460)),
  openPortrait: stacked('openPortrait', rect(0, 0, 951, 550), rect(0, 550, 951, 550)),
  openLandscape: sideBySide('openLandscape', rect(0, 0, 550, 951), rect(550, 0, 550, 951)),
  partlyFolded: sideBySide('partlyFolded', rect(0, 0, 530, 951), rect(570, 0, 530, 951)),
  partlyFoldedTabletop: stacked('partlyFoldedTabletop', rect(0, 0, 951, 530), rect(0, 570, 951, 530)),
  splitHalfLeading: stacked('splitHalfLeading', rect(0, 0, 530, 476), rect(0, 476, 530, 475)),
  splitHalfTrailing: stacked('splitHalfTrailing', rect(0, 0, 530, 476), rect(0, 476, 530, 475)),
  pipPinned: sideBySide('pipPinned', rect(0, 0, 550, 476), rect(550, 0, 550, 476)),
};
