import type { Insets, ReservedRegion, SizeClass, VerticalBarEdge, WindowSize } from './types';
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
export declare function sheetPlacement({ window, regions, regular, rtl, placement, insetTop, topGap, modal }: SheetPlacementInput): SheetPlacement;
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
export declare function sheetControlsStandVertical({ edge, sizeClass, side, verticalBarBehavior }: SheetControlsInput): boolean;
/**
 * The padding a horizontal row of controls keeps from the camera occlusions touching the window's sides, less what
 * the panel already sits in from them. Physical sides, swapped back where React Native swaps them in right to left.
 */
export declare function rowSidePadding(clearance: Insets, placement: Pick<SheetPlacement, 'x' | 'width'>, windowWidth: number, base: number): {
    paddingLeft: number;
    paddingRight: number;
};
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
export declare function columnInsetTop({ regions, placement, panelTop, edge, rtl, columnWidth, base }: ColumnInsetInput): number;
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
export declare function useSheetPose({ placement, verticalBarBehavior, modal, insetTop, topGap, columnWidth, columnPadding, }?: SheetPoseOptions): SheetPose;
