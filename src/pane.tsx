/**
 * The pane a component draws in: the whole window on a phone, one part of a split on the open iPhone Duo, an iPad or
 * either side of an active fold. Components size to `usePane()`, never to the window.
 */
import {createContext, useContext, useMemo, type ReactNode} from 'react';
import {I18nManager, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {activeDivision, splitParts, type Division} from './arrangement-layout';
import {useDuo} from './context';
import {placedFrame, useArrangementBox} from './measure';
import {REGULAR_WIDTH_MIN_DP} from './sizes';
import type {Axis, Rect, WindowSize} from './types';

export type PaneSide = 'only' | 'leading' | 'trailing';

/**
 * The edges of its box a pane reaches: the `PaneLayout` it is in, or the window outside one. `left` and `right` are the
 * sides a style names, so a right-to-left layout that swaps sides names the leading side `left`.
 */
export interface PaneEdges {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export const ALL_EDGES: PaneEdges = {top: true, bottom: true, left: true, right: true};

export interface Pane {
  split: boolean;
  side: PaneSide;
  /** Where the pane starts in the provider's root view, which region frames are in. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Mounted to keep its state but not on screen: a split view's detail behind its list on a compact window. */
  hidden: boolean;
  /** Where the safe area and a screen's own insets still apply: the edges of its `PaneLayout`, or of the window, it reaches. */
  edges: PaneEdges;
}

/** A pane to provide; without `edges`, they are read from where it sits in the window. */
export type PlacedPane = Omit<Pane, 'edges'> & {edges?: PaneEdges};

const PaneContext = createContext<PlacedPane | null>(null);

export function PaneProvider({pane, children}: {pane: PlacedPane; children: ReactNode}) {
  return <PaneContext.Provider value={pane}>{children}</PaneContext.Provider>;
}

function edgesInWindow(pane: Rect, window: WindowSize): PaneEdges {
  return {top: pane.y <= 0, bottom: pane.y + pane.height >= window.height, left: pane.x <= 0, right: pane.x + pane.width >= window.width};
}

/** The pane this component is in; outside any pane, the app's whole window. */
export function usePane(): Pane {
  const placed = useContext(PaneContext);
  const {window} = useDuo();
  return useMemo(
    () =>
      placed
        ? {...placed, edges: placed.edges ?? edgesInWindow(placed, window)}
        : {split: false, side: 'only', x: 0, y: 0, width: window.width, height: window.height, hidden: false, edges: ALL_EDGES},
    [placed, window],
  );
}

/** The edges of a box of `size` that `frame` (physical points) reaches, named as a style names them. */
export function edgesInBox(frame: Rect, size: WindowSize): PaneEdges {
  const TOLERANCE = 0.5;
  const physicalLeft = frame.x <= TOLERANCE;
  const physicalRight = frame.x + frame.width >= size.width - TOLERANCE;
  const swapped = I18nManager.isRTL && I18nManager.getConstants().doLeftAndRightSwapInRTL;
  return {
    top: frame.y <= TOLERANCE,
    bottom: frame.y + frame.height >= size.height - TOLERANCE,
    left: swapped ? physicalRight : physicalLeft,
    right: swapped ? physicalLeft : physicalRight,
  };
}

export const PANE_LAYOUT_TESTID = 'duo-pane-layout';
export const PANE_LEADING_TESTID = 'duo-pane-leading';
export const PANE_TRAILING_TESTID = 'duo-pane-trailing';

/** `sheet`: a sheet over a map. `list-detail`: a list and the row it opened. `side-by-side`: two contents at once. */
export type PaneArrangement = 'sheet' | 'list-detail' | 'side-by-side';

export interface PaneLayoutProps {
  /** Where you are: the map, the list, the feed. */
  leading: ReactNode;
  /** What you picked: the sheet, the detail, the selected item. */
  trailing: ReactNode;
  arrangement?: PaneArrangement;
  /** For `list-detail` on a compact window: which one pane shows (the detail once something is picked). */
  compact?: 'leading' | 'trailing';
  /** For `list-detail` side by side with no fold: the list's share of the width, like Apple's primary column. Default 0.35. */
  leadingFraction?: number;
  /** The list's narrowest width in points. Default 320. */
  minLeadingWidth?: number;
  /** The list's widest width in points. Default half the window. */
  maxLeadingWidth?: number;
  /** `auto` (the default) follows the pose; `always` or `never` forces two panes or one. An active fold still divides. */
  split?: 'auto' | 'always' | 'never';
  /**
   * The narrowest box that splits without a fold, in points. A regular window alone is not enough: a page sheet or
   * form sheet on an iPad is narrower than its window, and halves of it would each be narrower than a phone. Default 600.
   */
  minSplitWidth?: number;
  /**
   * For `sheet`: dock the sheet beside its map, left and right in halves, on a regular box (one at least
   * `minSplitWidth` wide on a regular window), in portrait too, instead of over it. Apple layers it; off by default.
   */
  dock?: boolean;
  /** The view the leading pane sits in. */
  leadingStyle?: StyleProp<ViewStyle>;
  /** The view the trailing pane sits in. */
  trailingStyle?: StyleProp<ViewStyle>;
  /** The view both panes sit in. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** The two frames of a list and its detail side by side with no fold: the list at `leadingWidth`, leading first. */
export function sidebarParts(size: WindowSize, leadingWidth: number, rtl: boolean): [Rect, Rect] {
  const width = Math.round(Math.min(Math.max(leadingWidth, 0), size.width));
  const list = {x: rtl ? size.width - width : 0, y: 0, width, height: size.height};
  const detail = {x: rtl ? 0 : width, y: 0, width: size.width - width, height: size.height};
  return [list, detail];
}

/** The list's width beside its detail: a fraction of the width within a minimum and a maximum, never over half. */
export function sidebarWidth(width: number, {fraction = 0.35, min = 320, max}: {fraction?: number; min?: number; max?: number} = {}): number {
  const half = width / 2;
  const ceiling = Math.min(max ?? half, half);
  return Math.min(Math.max(width * fraction, Math.min(min, ceiling)), ceiling);
}

function splitAxis(arrangement: PaneArrangement, size: WindowSize, division: Division | null, regular: boolean, dock: boolean): Axis | null {
  if (division) return division.axis;
  if (arrangement === 'side-by-side') return size.width > size.height ? 'horizontal' : 'vertical';
  if (arrangement === 'sheet') return dock && regular ? 'horizontal' : null;
  return regular ? 'horizontal' : null;
}

/** The list's frame and the detail's: at half the width they are the same halves any split without a fold has. */
function listDetailParts(size: WindowSize, leadingWidth: number, rtl: boolean): [Rect, Rect] {
  return Math.round(leadingWidth) === Math.round(size.width / 2) ? splitParts(size, 'horizontal', null, rtl) : sidebarParts(size, leadingWidth, rtl);
}

/**
 * Two layers or two contents sharing a window. Leading is where you are, trailing is what you picked.
 * - `sheet`: a map with a sheet over it, Apple's overlay arrangement: layered in every pose but an active fold, which
 *   puts the map on one side and the sheet on the other. Size the sheet to `usePane()`; on a regular width keep it a
 *   card at the bottom center rather than the full width. `dock` puts it beside the map on a regular box instead.
 * - `list-detail`: a list and the row it opened. One pane on a compact window or a box narrower than `minSplitWidth`
 *   (`compact` says which), both on a regular one.
 * - `side-by-side`: two contents at once. Side by side when wider than tall, stacked when taller than wide.
 * An active fold always divides the two and nothing straddles it. Both stay mounted in every pose, so folding keeps
 * their state; each child reads its own part through `usePane()`, hidden whenever the pane around the layout is.
 */
export function PaneLayout({
  leading,
  trailing,
  arrangement = 'sheet',
  compact = 'leading',
  leadingFraction,
  minLeadingWidth,
  maxLeadingWidth,
  split: forced = 'auto',
  minSplitWidth = REGULAR_WIDTH_MIN_DP,
  dock = false,
  leadingStyle,
  trailingStyle,
  style,
  testID = PANE_LAYOUT_TESTID,
}: PaneLayoutProps) {
  const {sizeClass, regions} = useDuo();
  const outer = usePane();
  const {ref, onLayout, size: measured, origin} = useArrangementBox();
  const size = measured ?? {width: outer.width, height: outer.height};
  const division = activeDivision({size, origin, regions});
  const regular = sizeClass.horizontal === 'regular' && size.width >= minSplitWidth;
  const automatic = splitAxis(arrangement, size, division, regular, dock);
  const axis = division ? division.axis : forced === 'never' ? null : forced === 'always' ? (automatic ?? (size.width >= size.height ? 'horizontal' : 'vertical')) : automatic;

  const whole = {x: 0, y: 0, width: size.width, height: size.height};
  const rtl = I18nManager.isRTL;
  const sidebar = arrangement === 'list-detail' && axis === 'horizontal' && !division;
  const [leadingFrame, trailingFrame] = !axis
    ? [whole, whole]
    : sidebar
      ? listDetailParts(size, sidebarWidth(size.width, {fraction: leadingFraction, min: minLeadingWidth, max: maxLeadingWidth}), rtl)
      : splitParts(size, axis, division, rtl);
  const split = axis !== null;
  const onePane = !split && arrangement === 'list-detail';
  const trailingHidden = outer.hidden || (onePane && compact === 'leading');
  const leadingHidden = outer.hidden || (onePane && compact === 'trailing');
  const leadingEdges = edgesInBox(leadingFrame, size);
  const trailingEdges = edgesInBox(trailingFrame, size);

  return (
    <View ref={ref} testID={testID} style={[styles.fill, style]} onLayout={onLayout}>
      <PaneProvider pane={{split, side: split ? 'leading' : 'only', x: origin.x + leadingFrame.x, y: origin.y + leadingFrame.y, width: leadingFrame.width, height: leadingFrame.height, hidden: leadingHidden, edges: leadingEdges}}>
        <View testID={PANE_LEADING_TESTID} style={[styles.pane, leadingStyle, placedFrame(leadingFrame), onePane && compact === 'trailing' && styles.hidden]}>
          {leading}
        </View>
      </PaneProvider>
      <PaneProvider pane={{split, side: split ? 'trailing' : 'only', x: origin.x + trailingFrame.x, y: origin.y + trailingFrame.y, width: trailingFrame.width, height: trailingFrame.height, hidden: trailingHidden, edges: trailingEdges}}>
        <View
          testID={PANE_TRAILING_TESTID}
          style={[styles.pane, trailingStyle, placedFrame(trailingFrame), onePane && compact === 'leading' && styles.hidden]}
          pointerEvents={split ? 'auto' : 'box-none'}>
          {trailing}
        </View>
      </PaneProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  pane: {overflow: 'hidden'},
  hidden: {display: 'none'},
});

/** Whether two contents have room to share this pane: a regular width, or an active fold crossing it. */
export function useSplitWindow(): boolean {
  const {sizeClass, regions} = useDuo();
  const {x, y, width, height} = usePane();
  return sizeClass.horizontal === 'regular' || activeDivision({size: {width, height}, origin: {x, y}, regions}) !== null;
}
