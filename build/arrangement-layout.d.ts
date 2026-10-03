/**
 * Where the primary and secondary views of an arrangement go. Follows Apple's arrangement views
 * (UIArrangementViewController): an overlay layers primary over secondary until an active division splits the
 * space, then puts primary in the trailing or bottom part and secondary in the leading or top part; a split puts
 * the views side by side when wider than tall and stacked when taller than wide, around an active division if
 * there is one. `axes` limits the directions an arrangement may divide in; a split with no direction left shows
 * only the primary view.
 */
import type { Axis, ArrangementKind, Rect, ReservedRegion, WindowSize } from './types';
export interface ViewState {
    frame: Rect;
    isHidden: boolean;
    splitAxis: Axis | null;
    zIndex: number;
}
export interface ArrangementLayout {
    primary: ViewState;
    secondary: ViewState;
}
export interface ArrangementInput {
    kind: ArrangementKind;
    axes: readonly Axis[];
    size: WindowSize;
    origin: {
        x: number;
        y: number;
    };
    regions: readonly ReservedRegion[];
    rtl: boolean;
    /** Overlay only: hide the secondary view and give the primary the whole box. */
    collapsed?: boolean;
}
export interface Division {
    frame: Rect;
    axis: Axis;
}
/** The first active division crossing a box at `origin` of `size` in the root view, in the box's own points; its axis is the direction it divides in. */
export declare function activeDivision({ size, origin, regions }: Pick<ArrangementInput, 'size' | 'origin' | 'regions'>): Division | null;
/** The two parts of a box divided along `axis`, around `division` or in halves, leading or top first. */
export declare function splitParts(size: WindowSize, axis: Axis, division: Division | null, rtl: boolean): [Rect, Rect];
export declare function arrangementLayout(input: ArrangementInput): ArrangementLayout;
