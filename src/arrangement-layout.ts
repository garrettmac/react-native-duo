/**
 * Where the primary and secondary views of an arrangement go. Follows Apple's arrangement views
 * (UIArrangementViewController): an overlay layers primary over secondary until an active division splits the
 * space, then puts primary in the trailing or bottom part and secondary in the leading or top part; a split puts
 * the views side by side when wider than tall and stacked when taller than wide, around an active division if
 * there is one. `axes` limits the directions an arrangement may divide in; a split with no direction left shows
 * only the primary view.
 */
import type {Axis, ArrangementKind, Rect, ReservedRegion, WindowSize} from './types';

export interface ViewState {
  frame: Rect;
  isHidden: boolean;
  splitAxis: Axis | null;
  zIndex: number;
}

export interface ArrangementLayout {
  primary: ViewState;
  secondary: ViewState;
}

export interface ArrangementInput {
  kind: ArrangementKind;
  axes: readonly Axis[];
  size: WindowSize;
  origin: {x: number; y: number};
  regions: readonly ReservedRegion[];
  rtl: boolean;
  /** Overlay only: hide the secondary view and give the primary the whole box. */
  collapsed?: boolean;
}

export interface Division {
  frame: Rect;
  axis: Axis;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** The first active division crossing a box at `origin` of `size` in the root view, in the box's own points; its axis is the direction it divides in. */
export function activeDivision({size, origin, regions}: Pick<ArrangementInput, 'size' | 'origin' | 'regions'>): Division | null {
  const box: Rect = {x: 0, y: 0, width: size.width, height: size.height};
  for (const region of regions) {
    if (region.kind !== 'division' || !region.isActive) continue;
    const frame: Rect = {x: region.frame.x - origin.x, y: region.frame.y - origin.y, width: region.frame.width, height: region.frame.height};
    if (intersects(frame, box)) return {frame, axis: frame.height >= frame.width ? 'horizontal' : 'vertical'};
  }
  return null;
}

/** The two parts either side of the division, or two halves when there is none: left or top first. */
function parts(size: WindowSize, axis: Axis, division: Division | null): [Rect, Rect] {
  const {width, height} = size;
  if (axis === 'horizontal') {
    const start = division ? clamp(division.frame.x, 0, width) : Math.round(width / 2);
    const end = division ? clamp(division.frame.x + division.frame.width, 0, width) : start;
    return [
      {x: 0, y: 0, width: start, height},
      {x: end, y: 0, width: width - end, height},
    ];
  }
  const start = division ? clamp(division.frame.y, 0, height) : Math.round(height / 2);
  const end = division ? clamp(division.frame.y + division.frame.height, 0, height) : start;
  return [
    {x: 0, y: 0, width, height: start},
    {x: 0, y: end, width, height: height - end},
  ];
}

/** Leading first: the right part comes first in a right-to-left layout. */
function leadingFirst(axis: Axis, rtl: boolean, [before, after]: [Rect, Rect]): [Rect, Rect] {
  return axis === 'horizontal' && rtl ? [after, before] : [before, after];
}

/** The two parts of a box divided along `axis`, around `division` or in halves, leading or top first. */
export function splitParts(size: WindowSize, axis: Axis, division: Division | null, rtl: boolean): [Rect, Rect] {
  return leadingFirst(axis, rtl, parts(size, axis, division));
}

function full(size: WindowSize): Rect {
  return {x: 0, y: 0, width: size.width, height: size.height};
}

function layered(size: WindowSize): ArrangementLayout {
  return {
    primary: {frame: full(size), isHidden: false, splitAxis: null, zIndex: 1},
    secondary: {frame: full(size), isHidden: false, splitAxis: null, zIndex: 0},
  };
}

function overlayLayout(input: ArrangementInput): ArrangementLayout {
  if (input.collapsed) {
    return {
      primary: {frame: full(input.size), isHidden: false, splitAxis: null, zIndex: 1},
      secondary: {frame: full(input.size), isHidden: true, splitAxis: null, zIndex: 0},
    };
  }
  const division = activeDivision(input);
  if (division === null || !input.axes.includes(division.axis)) return layered(input.size);
  const [leading, trailing] = splitParts(input.size, division.axis, division, input.rtl);
  return {
    primary: {frame: trailing, isHidden: false, splitAxis: division.axis, zIndex: 1},
    secondary: {frame: leading, isHidden: false, splitAxis: division.axis, zIndex: 0},
  };
}

function splitLayout(input: ArrangementInput): ArrangementLayout {
  const division = activeDivision(input);
  const axis: Axis = division ? division.axis : input.size.width > input.size.height ? 'horizontal' : 'vertical';
  if (!input.axes.includes(axis)) {
    return {
      primary: {frame: full(input.size), isHidden: false, splitAxis: null, zIndex: 0},
      secondary: {frame: full(input.size), isHidden: true, splitAxis: null, zIndex: 0},
    };
  }
  const [first, second] = splitParts(input.size, axis, division, input.rtl);
  return {
    primary: {frame: first, isHidden: false, splitAxis: axis, zIndex: 0},
    secondary: {frame: second, isHidden: false, splitAxis: axis, zIndex: 0},
  };
}

export function arrangementLayout(input: ArrangementInput): ArrangementLayout {
  return input.kind === 'overlay' ? overlayLayout(input) : splitLayout(input);
}
