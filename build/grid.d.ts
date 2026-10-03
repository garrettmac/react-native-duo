export interface EvenColumnOptions {
    /** Space between columns. */
    gap?: number;
    /** Space taken off the pane's width before columns are fitted: gutters, a vertical bar. */
    inset?: number;
    min?: number;
    max?: number;
}
/** Columns of at least `minCellWidth` that fit `width` with `gap` between them: 1 if only one fits, else the most even count up to `max`, never under `min`. */
export declare function evenColumnCount(width: number, minCellWidth: number, { gap, min, max }?: Omit<EvenColumnOptions, 'inset'>): number;
export declare function useEvenColumns(minCellWidth: number, { gap, inset, min, max }?: EvenColumnOptions): number;
