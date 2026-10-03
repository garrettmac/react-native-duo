import type { ReservedRegion, ReservedRegionKind, SizeClass, VerticalBarEdge } from './types';
export declare function useSizeClass(): SizeClass;
export declare function useVerticalBarEdge(): VerticalBarEdge;
export interface ReservedRegionQuery {
    kind?: ReservedRegionKind;
    includeInactive?: boolean;
}
/** The reserved regions of one kind, or both kinds when `kind` is left out; only the active ones unless `includeInactive`. */
export declare function useReservedRegions({ kind, includeInactive }?: ReservedRegionQuery): ReservedRegion[];
export interface BarInsets {
    top: number;
    bottom: number;
    leading: number;
    trailing: number;
}
/**
 * What content keeps clear of a vertical bar `barWidth` points wide: the bar's width on its edge, zero elsewhere.
 * The width is the app's own bar; the system publishes none for a custom one.
 */
export declare function useBarInsets(barWidth: number): BarInsets;
