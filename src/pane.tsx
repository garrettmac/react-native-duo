/**
 * The pane a component draws in: the whole window on a phone, one part of a split on the open iPhone Duo, an iPad or
 * either side of an active fold. Components size to `usePane()`, never to the window.
 */
import {createContext, useContext, useMemo, type ReactNode} from 'react';
import {I18nManager, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {activeDivision, splitParts, type Division} from './arrangement-layout';
import {useDuo} from './context';
import {placedFrame, useArrangementBox} from './measure';
import type {Axis, Rect, WindowSize} from './types';

export type PaneSide = 'only' | 'leading' | 'trailing';

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
}

const PaneContext = createContext<Pane | null>(null);

export function PaneProvider({pane, children}: {pane: Pane; children: ReactNode}) {
  return <PaneContext.Provider value={pane}>{children}</PaneContext.Provider>;
}

/** The pane this component is in; outside any pane, the app's whole window. */
export function usePane(): Pane {
  const placed = useContext(PaneContext);
  const {window} = useDuo();
  return useMemo(() => placed ?? {split: false, side: 'only', x: 0, y: 0, width: window.width, height: window.height, hidden: false}, [placed, window]);
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

function splitAxis(arrangement: PaneArrangement, size: WindowSize, division: Division | null, regular: boolean): Axis | null {
  if (division) return division.axis;
  if (arrangement === 'side-by-side') return size.width > size.height ? 'horizontal' : 'vertical';
  if (arrangement === 'sheet') return null;
  return regular ? 'horizontal' : null;
}

/**
 * Two layers or two contents sharing a window. Leading is where you are, trailing is what you picked.
 * - `sheet`: a map with a sheet over it, Apple's overlay arrangement: layered in every pose but an active fold, which
 *   puts the map on one side and the sheet on the other. Size the sheet to `usePane()`; on a regular width keep it a
 *   card at the bottom center rather than the full width.
 * - `list-detail`: a list and the row it opened. One pane on a compact window (`compact` says which), both on a regular one.
 * - `side-by-side`: two contents at once. Side by side when wider than tall, stacked when taller than wide.
 * An active fold always divides the two and nothing straddles it. Both stay mounted in every pose, so folding keeps
 * their state; each child reads its own part through `usePane()`.
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
  const automatic = splitAxis(arrangement, size, division, sizeClass.horizontal === 'regular');
  const axis = division ? division.axis : forced === 'never' ? null : forced === 'always' ? (automatic ?? (size.width >= size.height ? 'horizontal' : 'vertical')) : automatic;

  const whole = {x: 0, y: 0, width: size.width, height: size.height};
  const rtl = I18nManager.isRTL;
  const sidebar = arrangement === 'list-detail' && axis === 'horizontal' && !division;
  const [leadingFrame, trailingFrame] = !axis
    ? [whole, whole]
    : sidebar
      ? sidebarParts(size, sidebarWidth(size.width, {fraction: leadingFraction, min: minLeadingWidth, max: maxLeadingWidth}), rtl)
      : splitParts(size, axis, division, rtl);
  const split = axis !== null;
  const onePane = !split && arrangement === 'list-detail';
  const trailingHidden = onePane && compact === 'leading';
  const leadingHidden = onePane && compact === 'trailing';

  return (
    <View ref={ref} testID={testID} style={[styles.fill, style]} onLayout={onLayout}>
      <PaneProvider pane={{split, side: split ? 'leading' : 'only', x: origin.x + leadingFrame.x, y: origin.y + leadingFrame.y, width: leadingFrame.width, height: leadingFrame.height, hidden: leadingHidden}}>
        <View testID={PANE_LEADING_TESTID} style={[styles.pane, leadingStyle, placedFrame(leadingFrame), leadingHidden && styles.hidden]}>
          {leading}
        </View>
      </PaneProvider>
      <PaneProvider pane={{split, side: split ? 'trailing' : 'only', x: origin.x + trailingFrame.x, y: origin.y + trailingFrame.y, width: trailingFrame.width, height: trailingFrame.height, hidden: trailingHidden}}>
        <View
          testID={PANE_TRAILING_TESTID}
          style={[styles.pane, trailingStyle, placedFrame(trailingFrame), trailingHidden && styles.hidden]}
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
