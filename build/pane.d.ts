/**
 * The pane a component draws in: the whole window on a phone, one part of a split on the open iPhone Duo, an iPad or
 * either side of an active fold. Components size to `usePane()`, never to the window.
 */
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import type { Rect, WindowSize } from './types';
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
export declare function PaneProvider({ pane, children }: {
    pane: Pane;
    children: ReactNode;
}): import("react").JSX.Element;
/** The pane this component is in; outside any pane, the app's whole window. */
export declare function usePane(): Pane;
export declare const PANE_LAYOUT_TESTID = "duo-pane-layout";
export declare const PANE_LEADING_TESTID = "duo-pane-leading";
export declare const PANE_TRAILING_TESTID = "duo-pane-trailing";
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
export declare function sidebarParts(size: WindowSize, leadingWidth: number, rtl: boolean): [Rect, Rect];
/** The list's width beside its detail: a fraction of the width within a minimum and a maximum, never over half. */
export declare function sidebarWidth(width: number, { fraction, min, max }?: {
    fraction?: number;
    min?: number;
    max?: number;
}): number;
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
export declare function PaneLayout({ leading, trailing, arrangement, compact, leadingFraction, minLeadingWidth, maxLeadingWidth, split: forced, leadingStyle, trailingStyle, style, testID, }: PaneLayoutProps): import("react").JSX.Element;
/** Whether two contents have room to share this pane: a regular width, or an active fold crossing it. */
export declare function useSplitWindow(): boolean;
