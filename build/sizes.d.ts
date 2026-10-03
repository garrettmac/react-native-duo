/**
 * The size class a platform without UIKit traits gets from the window. The cut-offs are the Android window size
 * classes: width is compact below 600dp and height is compact below 480dp.
 */
import type { SizeClass, WindowSize } from './types';
export declare const REGULAR_WIDTH_MIN_DP = 600;
export declare const REGULAR_HEIGHT_MIN_DP = 480;
export declare function sizeClassFromWindow({ width, height }: WindowSize): SizeClass;
