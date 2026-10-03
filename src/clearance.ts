/**
 * How far controls keep from the camera occlusions: each region's frame grown by its margins is the keep-out, and it
 * belongs to the window edge it clears with the least depth, so the camera inset in the closed iPhone Duo's top
 * corner keeps the top clear, not the side.
 */
import {useMemo} from 'react';
import {I18nManager, type ViewStyle} from 'react-native';

import {useDuo} from './context';
import {useReservedRegions} from './hooks';
import type {Insets, Rect, ReservedRegion, WindowSize} from './types';

export const NO_CLEARANCE: Insets = {top: 0, left: 0, bottom: 0, right: 0};

type Edge = keyof Insets;

const EDGES: readonly Edge[] = ['top', 'bottom', 'left', 'right'];

/** A region's frame grown by its margins: what controls keep out of. */
export function keepOut({frame, margins}: ReservedRegion): Rect {
  return {
    x: frame.x - margins.left,
    y: frame.y - margins.top,
    width: frame.width + margins.left + margins.right,
    height: frame.height + margins.top + margins.bottom,
  };
}

function depths(box: Rect, window: WindowSize): Record<Edge, number | null> {
  const depth = (value: number, length: number): number | null => (value > 0 && value <= length ? value : null);
  return {
    top: depth(box.y + box.height, window.height),
    bottom: depth(window.height - box.y, window.height),
    left: depth(box.x + box.width, window.width),
    right: depth(window.width - box.x, window.width),
  };
}

export function cameraClearance(regions: readonly ReservedRegion[], window: WindowSize): Insets {
  const result: Insets = {...NO_CLEARANCE};
  for (const region of regions) {
    if (region.kind !== 'occlusion') continue;
    const byEdge = depths(keepOut(region), window);
    let nearest: Edge | null = null;
    for (const edge of EDGES) {
      const value = byEdge[edge];
      if (value !== null && (nearest === null || value < (byEdge[nearest] as number))) nearest = edge;
    }
    if (nearest !== null) result[nearest] = Math.max(result[nearest], byEdge[nearest] as number);
  }
  return result;
}

/** The larger of two insets on every edge, for folding the safe area in. */
export function maxInsets(a: Insets, b: Insets): Insets {
  return {top: Math.max(a.top, b.top), left: Math.max(a.left, b.left), bottom: Math.max(a.bottom, b.bottom), right: Math.max(a.right, b.right)};
}

/** Physical insets as padding, each at least `base`; swaps back the sides React Native swaps in a right-to-left layout. */
export function clearancePadding(insets: Insets, base = 0): Pick<ViewStyle, 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight'> {
  const swapped = I18nManager.isRTL && I18nManager.getConstants().doLeftAndRightSwapInRTL;
  return {
    paddingTop: Math.max(base, insets.top),
    paddingBottom: Math.max(base, insets.bottom),
    paddingLeft: Math.max(base, swapped ? insets.right : insets.left),
    paddingRight: Math.max(base, swapped ? insets.left : insets.right),
  };
}

/**
 * The clearance an immersive screen's controls keep from the cameras. Pass `includeInactive` only on a screen that
 * turns a camera on: the inner camera is reserved only while it is on.
 */
export function useCameraClearance({includeInactive = false}: {includeInactive?: boolean} = {}): Insets {
  const regions = useReservedRegions({kind: 'occlusion', includeInactive});
  const {window} = useDuo();
  return useMemo(() => cameraClearance(regions, window), [regions, window]);
}
