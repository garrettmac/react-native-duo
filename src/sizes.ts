/**
 * The size class a platform without UIKit traits gets from the window. The cut-offs are the Android window size
 * classes: width is compact below 600dp and height is compact below 480dp.
 */
import type {SizeClass, WindowSize} from './types';

export const REGULAR_WIDTH_MIN_DP = 600;
export const REGULAR_HEIGHT_MIN_DP = 480;

export function sizeClassFromWindow({width, height}: WindowSize): SizeClass {
  return {
    horizontal: width >= REGULAR_WIDTH_MIN_DP ? 'regular' : 'compact',
    vertical: height >= REGULAR_HEIGHT_MIN_DP ? 'regular' : 'compact',
  };
}
