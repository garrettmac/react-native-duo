/**
 * Where a sheet sits and how its controls stand in each pose, after Apple's sheet behavior on iPhone Duo: the whole
 * width on a compact window, its controls standing on the side by default; centered (or leading or trailing, as asked)
 * on a regular window; beside an active fold, never across it. A sheet whose vertical bar is disabled keeps a
 * horizontal row that stops short of the outer camera.
 */
import {useMemo} from 'react';
import {I18nManager} from 'react-native';

import {activeDivision, splitParts} from './arrangement-layout';
import {keepOut, useCameraClearance} from './clearance';
import {useDuo} from './context';
import type {Insets, ReservedRegion, SizeClass, VerticalBarEdge, WindowSize} from './types';

/** `UISheetPresentationController.Placement`. `automatic` is centered on a regular window. */
export type SheetPlacementPreference = 'automatic' | 'center' | 'leading' | 'trailing';

/** `UIVerticalBarBehavior`. `disabled` keeps the sheet's controls in a horizontal row: right for a sheet with a single action. */
export type VerticalBarBehavior = 'automatic' | 'disabled';

export interface SheetPlacement {
  /** True when the sheet fills part of the window (a half, or the part beside the fold) instead of its whole width. */
  split: boolean;
  /** The panel's physical left edge in the window. */
  x: number;
  width: number;
  /** The panel's height when it is fixed; null for a card sheet that takes its content's height. */
  height: number | null;
  /** The panel's top edge in the window when its height is fixed (it stands on the window's bottom); null for a card sheet. */
  y: number | null;
  /** Where the panel resolved to. */
  side: 'full' | 'center' | 'leading' | 'trailing';
}

export interface SheetPlacementInput {
  window: WindowSize;
  regions: readonly ReservedRegion[];
  regular: boolean;
  rtl: boolean;
  placement?: SheetPlacementPreference;
  /** The safe-area top, which a full-height panel stays below. */
  insetTop?: number;
  /** The gap a full-height panel leaves under the status bar. */
  topGap?: number;
  /** True for a sheet with a fixed height; false for a card sheet that takes its content's height on a compact window. */
  modal?: boolean;
}

export function sheetPlacement({window, regions, regular, rtl, placement = 'automatic', insetTop = 0, topGap = 0, modal = true}: SheetPlacementInput): SheetPlacement {
  const fullHeight = window.height - insetTop - topGap;
  const division = activeDivision({size: window, origin: {x: 0, y: 0}, regions});
  if (division !== null) {
    const [leading, trailing] = splitParts(window, division.axis, division, rtl);
    const side = placement === 'leading' && division.axis === 'horizontal' ? 'leading' : 'trailing';
    const part = side === 'leading' ? leading : trailing;
    const height = division.axis === 'horizontal' ? fullHeight : part.height;
    return {split: true, x: part.x, width: part.width, height, y: window.height - height, side};
  }
  if (regular) {
    const [leading, trailing] = splitParts(window, 'horizontal', null, rtl);
    const y = window.height - fullHeight;
    if (placement === 'leading') return {split: true, x: leading.x, width: leading.width, height: fullHeight, y, side: 'leading'};
    if (placement === 'trailing') return {split: true, x: trailing.x, width: trailing.width, height: fullHeight, y, side: 'trailing'};
    const width = trailing.width;
    return {split: true, x: Math.round((window.width - width) / 2), width, height: fullHeight, y, side: 'center'};
  }
  return modal
    ? {split: false, x: 0, width: window.width, height: window.height - topGap, y: topGap, side: 'full'}
    : {split: false, x: 0, width: window.width, height: null, y: null, side: 'full'};
}

export interface SheetControlsInput {
  edge: VerticalBarEdge;
  sizeClass: SizeClass;
  side: SheetPlacement['side'];
  verticalBarBehavior?: VerticalBarBehavior;
}

/**
 * Whether a sheet's controls stand vertical: on the closed phone by default; on the open display only in a trailing
 * sheet where the system stands bars on the side; never when the vertical bar is disabled.
 */
export function sheetControlsStandVertical({edge, sizeClass, side, verticalBarBehavior = 'automatic'}: SheetControlsInput): boolean {
  if (verticalBarBehavior === 'disabled' || edge === null) return false;
  if (sizeClass.horizontal === 'compact') return true;
  return side === 'trailing';
}

/**
 * The padding a horizontal row of controls keeps from the camera occlusions touching the window's sides, less what
 * the panel already sits in from them. Physical sides, swapped back where React Native swaps them in right to left.
 */
export function rowSidePadding(clearance: Insets, placement: Pick<SheetPlacement, 'x' | 'width'>, windowWidth: number, base: number): {paddingLeft: number; paddingRight: number} {
  const left = Math.max(base, clearance.left - placement.x);
  const right = Math.max(base, clearance.right - (windowWidth - placement.x - placement.width));
  const swapped = I18nManager.isRTL && I18nManager.getConstants().doLeftAndRightSwapInRTL;
  return swapped ? {paddingLeft: right, paddingRight: left} : {paddingLeft: left, paddingRight: right};
}

export interface ColumnInsetInput {
  regions: readonly ReservedRegion[];
  placement: Pick<SheetPlacement, 'x' | 'width'>;
  /** The panel's top edge in the window: `placement.y`, or a card sheet's measured top. */
  panelTop: number;
  /** The bar edge the column stands on. */
  edge: 'leading' | 'trailing';
  rtl: boolean;
  /** The column's width. */
  columnWidth: number;
  /** The padding the column keeps when no camera is above it. */
  base: number;
}

/**
 * The top padding a vertical column of sheet controls keeps so its first control lands below every active camera
 * occlusion (grown by its margins) that the column's own strip of the panel runs under. A camera elsewhere along the
 * top, such as over the other side of the panel, moves nothing.
 */
export function columnInsetTop({regions, placement, panelTop, edge, rtl, columnWidth, base}: ColumnInsetInput): number {
  const physicalLeft = (edge === 'leading') !== rtl;
  const left = physicalLeft ? placement.x : placement.x + placement.width - columnWidth;
  const right = left + columnWidth;
  const boxes = regions
    .filter(region => region.kind === 'occlusion' && region.isActive)
    .map(keepOut)
    .filter(box => box.x < right && box.x + box.width > left)
    .sort((a, b) => a.y - b.y);
  // The first control is about as tall as the column is wide; a camera it would touch pushes it down past the camera.
  let inset = base;
  for (const box of boxes) {
    const top = panelTop + inset;
    if (box.y < top + columnWidth && box.y + box.height > top) inset = box.y + box.height - panelTop;
  }
  return inset;
}

export interface SheetPoseOptions {
  placement?: SheetPlacementPreference;
  verticalBarBehavior?: VerticalBarBehavior;
  modal?: boolean;
  insetTop?: number;
  topGap?: number;
  /** The width of the column the controls stand in when they stand vertical, for clearing the cameras. Default 44. */
  columnWidth?: number;
  /** The padding the vertical column keeps above its first control when no camera is above it. Default 0. */
  columnPadding?: number;
}

export interface SheetPose {
  window: WindowSize;
  placement: SheetPlacement;
  /** True when the sheet's controls stand in a vertical strip on the system's bar edge. */
  vertical: boolean;
  edge: VerticalBarEdge;
  /** How far a horizontal row keeps from the cameras. */
  clearance: Insets;
  /**
   * The top padding the vertical column keeps so its controls clear the cameras over it; null when the controls are
   * in a row, or for a card sheet, whose top only its layout knows (pass the measured top to `columnInsetTop()`).
   */
  columnInsetTop: number | null;
}

/** Everything a custom sheet needs to follow the pose, re-read on every change. */
export function useSheetPose({
  placement = 'automatic',
  verticalBarBehavior = 'automatic',
  modal = true,
  insetTop = 0,
  topGap = 0,
  columnWidth = 44,
  columnPadding = 0,
}: SheetPoseOptions = {}): SheetPose {
  const {window, regions, sizeClass, verticalBarEdge} = useDuo();
  const clearance = useCameraClearance();
  const regular = sizeClass.horizontal === 'regular';
  const resolved = useMemo(
    () => sheetPlacement({window, regions, regular, rtl: I18nManager.isRTL, placement, insetTop, topGap, modal}),
    [window, regions, regular, placement, insetTop, topGap, modal],
  );
  const vertical = sheetControlsStandVertical({edge: verticalBarEdge, sizeClass, side: resolved.side, verticalBarBehavior});
  const inset = useMemo(
    () =>
      vertical && verticalBarEdge !== null && resolved.y !== null
        ? columnInsetTop({regions, placement: resolved, panelTop: resolved.y, edge: verticalBarEdge, rtl: I18nManager.isRTL, columnWidth, base: columnPadding})
        : null,
    [vertical, verticalBarEdge, resolved, regions, columnWidth, columnPadding],
  );
  return {window, placement: resolved, vertical, edge: verticalBarEdge, clearance, columnInsetTop: inset};
}
