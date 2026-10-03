/**
 * The fold: the active division crossing the app's window, and how a control steps out of it the way Apple's own
 * sheets, alerts, menus and toolbar buttons do. Scrolling content may pass under the fold; tappable controls may not.
 */
import {useMemo, type ReactNode} from 'react';
import {View, type StyleProp, type ViewStyle} from 'react-native';

import {useDuo} from './context';
import {useArrangementBox} from './measure';
import type {Axis, Insets, Rect, ReservedRegion} from './types';

export interface Fold {
  /** The fold's frame in the root view's points. */
  frame: Rect;
  /** The room around the fold that tappable controls keep clear of. */
  margins: Insets;
  /** `horizontal` when the fold is a vertical line and divides the window into left and right; `vertical` when it stacks them. */
  axis: Axis;
}

/** The first active division, or null when the device is closed, fully open, or not foldable. */
export function activeFold(regions: readonly ReservedRegion[]): Fold | null {
  const region = regions.find(r => r.kind === 'division' && r.isActive);
  if (!region) return null;
  return {frame: region.frame, margins: region.margins, axis: region.frame.height >= region.frame.width ? 'horizontal' : 'vertical'};
}

export function useFold(): Fold | null {
  const {regions} = useDuo();
  return useMemo(() => activeFold(regions), [regions]);
}

function keepOut({frame, margins}: Pick<ReservedRegion, 'frame' | 'margins'>): Rect {
  return {
    x: frame.x - margins.left,
    y: frame.y - margins.top,
    width: frame.width + margins.left + margins.right,
    height: frame.height + margins.top + margins.bottom,
  };
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/**
 * How far a box (in root points) moves to clear every active reserved region it overlaps: along the fold's axis,
 * toward the side its center is already on. Zero when it overlaps nothing.
 */
export function avoidanceOffset(box: Rect, regions: readonly ReservedRegion[]): {x: number; y: number} {
  let x = 0;
  let y = 0;
  for (const region of regions) {
    if (!region.isActive) continue;
    const zone = keepOut(region);
    const moved = {...box, x: box.x + x, y: box.y + y};
    if (!overlaps(moved, zone)) continue;
    const sideways = region.kind === 'division' ? region.frame.height >= region.frame.width : zone.width <= zone.height;
    if (sideways) {
      const before = moved.x + moved.width / 2 < zone.x + zone.width / 2;
      x += before ? zone.x - (moved.x + moved.width) : zone.x + zone.width - moved.x;
    } else {
      const above = moved.y + moved.height / 2 < zone.y + zone.height / 2;
      y += above ? zone.y - (moved.y + moved.height) : zone.y + zone.height - moved.y;
    }
  }
  return {x, y};
}

export interface AvoidReservedRegionsProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Wraps a tappable control and nudges it out of the fold and any active camera region by the smallest move that
 * clears it. Wrap buttons, toggles and chips; never wrap scrolling content.
 */
export function AvoidReservedRegions({children, style, testID}: AvoidReservedRegionsProps) {
  const {regions} = useDuo();
  const {ref, onLayout, size, origin} = useArrangementBox();
  const offset = useMemo(
    () => (size ? avoidanceOffset({x: origin.x, y: origin.y, width: size.width, height: size.height}, regions) : {x: 0, y: 0}),
    [size, origin, regions],
  );
  return (
    <View ref={ref} testID={testID} onLayout={onLayout} style={[style, {transform: [{translateX: offset.x}, {translateY: offset.y}]}]}>
      {children}
    </View>
  );
}
