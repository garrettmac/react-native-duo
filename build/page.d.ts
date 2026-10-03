/**
 * A screen's bars, wherever the pose puts them. On a phone, an iPad or any window the system keeps bars horizontal,
 * `DuoPage` is a plain column: the top bar, the content, the bottom bar, exactly as you pass them. Where the system
 * stands bars on the side (the closed iPhone Duo, open in landscape, the pane against the window's edge), the same
 * bars move into one vertical strip on that edge: the top bar's controls at the top, the bottom bar's at the bottom.
 * A page inside a pane that does not touch the edge keeps its bars horizontal at the top of its pane, and a page
 * inside a pane that does gives its bars to the strip of the page around it, so a window has one strip per edge.
 */
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { touchesEdge, type PageMode, type PagePlacement } from './page-context';
import type { Rect, VerticalBarEdge } from './types';
export type BarPosition = 'top' | 'bottom' | 'side';
/** Where a bar is being drawn: `vertical` is true when it stands in the side strip. */
export interface BarPlacement {
    position: BarPosition;
    vertical: boolean;
    edge: VerticalBarEdge;
}
/** A bar: an element, or a function of where it is drawn so one component can lay itself out either way. */
export type BarSlot = ReactNode | ((placement: BarPlacement) => ReactNode);
export interface DuoPageProps {
    children: ReactNode;
    /** The navigation bar or top toolbar. Back or Close first, then the prominent action. */
    topBar?: BarSlot;
    /** The tab bar or bottom toolbar. */
    bottomBar?: BarSlot;
    /** Drawn in the strip instead of `topBar` when bars stand on the side. */
    sideTopBar?: BarSlot;
    /** Drawn in the strip instead of `bottomBar` when bars stand on the side. */
    sideBottomBar?: BarSlot;
    /** The page: on a phone, the column the three parts sit in. */
    style?: StyleProp<ViewStyle>;
    /** The strip, when bars stand on the side: its width, background, border and padding. */
    sideStyle?: StyleProp<ViewStyle>;
    /** The view the content sits in. */
    contentStyle?: StyleProp<ViewStyle>;
    /** Wraps the top bar on a phone (none when left out, so the bar renders exactly as passed). */
    topBarStyle?: StyleProp<ViewStyle>;
    /** Wraps the bottom bar on a phone (none when left out). */
    bottomBarStyle?: StyleProp<ViewStyle>;
    /** Points the strip keeps free at its top. Defaults to the camera's clearance there. */
    sideInsetTop?: number;
    /** Points the strip keeps free at its bottom, where the closed iPhone Duo's camera sits in landscape. Defaults to the camera's clearance there. */
    sideInsetBottom?: number;
    /** Draws the whole strip yourself; it receives what would go in it, this page's and any nested page's. */
    renderSide?: (side: SideParts) => ReactNode;
    /** `auto` (the default) follows the pose; `horizontal` or `side` forces one. */
    mode?: 'auto' | 'horizontal' | 'side';
    /** False keeps a nested page's bars in its own pane instead of the strip around it. Default true. */
    shareSide?: boolean;
    /** Called when the page moves its bars between horizontal, its own strip and the one around it. */
    onModeChange?: (mode: PageMode) => void;
    testID?: string;
}
/** What goes in the strip, top to bottom: nested pages' top bars, this page's, then the bottom bars. */
export interface SideParts {
    edge: 'leading' | 'trailing';
    top: ReactNode[];
    bottom: ReactNode[];
    insetTop: number;
    insetBottom: number;
}
interface Contribution {
    top: ReactNode;
    bottom: ReactNode;
}
interface Host {
    edge: 'leading' | 'trailing';
    frame: Rect;
    contribute: (id: string, contribution: Contribution | null) => void;
}
export { touchesEdge };
export type { PageMode, PagePlacement };
export declare const DUO_PAGE_TESTID = "duo-page";
export declare const DUO_PAGE_STRIP_TESTID = "duo-page-strip";
export declare const DUO_PAGE_CONTENT_TESTID = "duo-page-content";
/** The decision `DuoPage` makes: hand bars to the strip around it, stand its own, or keep them in place. */
export declare function pageMode({ edge, pane, window, host, rtl }: {
    edge: VerticalBarEdge;
    pane: Rect;
    window: Rect;
    host: Pick<Host, 'edge' | 'frame'> | null;
    rtl: boolean;
}): PageMode;
/** Where the page this component is in draws its bars. Draw the title in the content when `vertical`. */
export declare function usePage(): PagePlacement;
export declare function DuoPage({ children, topBar, bottomBar, sideTopBar, sideBottomBar, style, sideStyle, contentStyle, topBarStyle, bottomBarStyle, sideInsetTop, sideInsetBottom, renderSide, mode: forced, shareSide, onModeChange, testID, }: DuoPageProps): import("react").JSX.Element;
