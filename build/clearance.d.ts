import { type ViewStyle } from 'react-native';
import type { Insets, Rect, ReservedRegion, WindowSize } from './types';
export declare const NO_CLEARANCE: Insets;
/** A region's frame grown by its margins: what controls keep out of. */
export declare function keepOut({ frame, margins }: ReservedRegion): Rect;
export declare function cameraClearance(regions: readonly ReservedRegion[], window: WindowSize): Insets;
/** The larger of two insets on every edge, for folding the safe area in. */
export declare function maxInsets(a: Insets, b: Insets): Insets;
/** Physical insets as padding, each at least `base`; swaps back the sides React Native swaps in a right-to-left layout. */
export declare function clearancePadding(insets: Insets, base?: number): Pick<ViewStyle, 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight'>;
/**
 * The clearance an immersive screen's controls keep from the cameras. Pass `includeInactive` only on a screen that
 * turns a camera on: the inner camera is reserved only while it is on.
 */
export declare function useCameraClearance({ includeInactive }?: {
    includeInactive?: boolean;
}): Insets;
