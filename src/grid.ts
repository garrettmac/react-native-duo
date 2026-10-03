/**
 * How many columns a grid draws: one when only one fits, otherwise an even number, so on the iPhone Duo the fold
 * falls between two columns and no cell straddles it. Computed from the pane the grid is in, never the window.
 */
import {usePane} from './pane';

export interface EvenColumnOptions {
  /** Space between columns. */
  gap?: number;
  /** Space taken off the pane's width before columns are fitted: gutters, a vertical bar. */
  inset?: number;
  min?: number;
  max?: number;
}

/** Columns of at least `minCellWidth` that fit `width` with `gap` between them: 1 if only one fits, else the most even count up to `max`, never under `min`. */
export function evenColumnCount(width: number, minCellWidth: number, {gap = 0, min = 1, max = 4}: Omit<EvenColumnOptions, 'inset'> = {}): number {
  const fit = Number.isFinite(width) && width > 0 ? Math.floor((width + gap) / (minCellWidth + gap)) : 0;
  const even = fit < 2 ? 1 : Math.min(fit - (fit % 2), max - (max % 2));
  return Math.max(min, even);
}

export function useEvenColumns(minCellWidth: number, {gap = 0, inset = 0, min = 1, max = 4}: EvenColumnOptions = {}): number {
  const {width} = usePane();
  return evenColumnCount(width - inset, minCellWidth, {gap, min, max});
}
