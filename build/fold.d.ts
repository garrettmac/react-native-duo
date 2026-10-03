/**
 * The fold: the active division crossing the app's window, and how a control steps out of it the way Apple's own
 * sheets, alerts, menus and toolbar buttons do. Scrolling content may pass under the fold; tappable controls may not.
 */
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import type { Axis, Insets, Rect, ReservedRegion } from './types';
export interface Fold {
    /** The fold's frame in the root view's points. */
    frame: Rect;
    /** The room around the fold that tappable controls keep clear of. */
    margins: Insets;
    /** `horizontal` when the fold is a vertical line and divides the window into left and right; `vertical` when it stacks them. */
    axis: Axis;
}
/** The first active division, or null when the device is closed, fully open, or not foldable. */
export declare function activeFold(regions: readonly ReservedRegion[]): Fold | null;
export declare function useFold(): Fold | null;
/**
 * How far a box (in root points) moves to clear every active reserved region it overlaps: along the fold's axis,
 * toward the side its center is already on. Zero when it overlaps nothing.
 */
export declare function avoidanceOffset(box: Rect, regions: readonly ReservedRegion[]): {
    x: number;
    y: number;
};
export interface AvoidReservedRegionsProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * Wraps a tappable control and nudges it out of the fold and any active camera region by the smallest move that
 * clears it. Wrap buttons, toggles and chips; never wrap scrolling content.
 */
export declare function AvoidReservedRegions({ children, style, testID }: AvoidReservedRegionsProps): import("react").JSX.Element;
