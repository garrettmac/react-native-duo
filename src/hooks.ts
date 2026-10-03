/** The hooks: each reads the provider's state, or the window when there is no provider. */
import {useMemo} from 'react';

import {useDuo} from './context';
import {usePaneBarEdge} from './page-context';
import type {ReservedRegion, ReservedRegionKind, SizeClass, VerticalBarEdge} from './types';

export function useSizeClass(): SizeClass {
  return useDuo().sizeClass;
}

export function useVerticalBarEdge(): VerticalBarEdge {
  return useDuo().verticalBarEdge;
}

export interface ReservedRegionQuery {
  kind?: ReservedRegionKind;
  includeInactive?: boolean;
}

/** The reserved regions of one kind, or both kinds when `kind` is left out; only the active ones unless `includeInactive`. */
export function useReservedRegions({kind, includeInactive = false}: ReservedRegionQuery = {}): ReservedRegion[] {
  const {regions} = useDuo();
  return useMemo(
    () => regions.filter(region => (kind === undefined || region.kind === kind) && (includeInactive || region.isActive)),
    [regions, kind, includeInactive],
  );
}

export interface BarInsets {
  top: number;
  bottom: number;
  leading: number;
  trailing: number;
}

const NO_INSETS: BarInsets = {top: 0, bottom: 0, leading: 0, trailing: 0};

/**
 * What content keeps clear of a vertical bar `barWidth` points wide: the bar's width on its edge, zero elsewhere.
 * The width is the app's own bar; the system publishes none for a custom one.
 */
export function useBarInsets(barWidth: number): BarInsets {
  const edge = usePaneBarEdge();
  return useMemo(() => {
    if (edge === 'leading') return {...NO_INSETS, leading: barWidth};
    if (edge === 'trailing') return {...NO_INSETS, trailing: barWidth};
    return NO_INSETS;
  }, [edge, barWidth]);
}
