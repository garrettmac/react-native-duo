import type { Rect, VerticalBarEdge } from './types';
/** How a page draws its bars: in place, in its own strip, or in the strip of the page around it. */
export type PageMode = 'horizontal' | 'side' | 'hosted';
export interface PagePlacement {
    mode: PageMode;
    /** True when this page's bars stand on the side, in its own strip or the one around it. */
    vertical: boolean;
    edge: VerticalBarEdge;
}
export declare const PageContext: import("react").Context<PagePlacement | null>;
/** Whether `box` reaches the top of `within` and its side on `edge`, in physical points (right to left aware). */
export declare function touchesEdge(box: Rect, within: Rect, edge: 'leading' | 'trailing', rtl: boolean): boolean;
/**
 * The edge this pane's bars stand on: the page's, inside a `DuoPage`; otherwise the system's edge when the pane
 * reaches the top of the window and that side of it, and none for a pane elsewhere (the list beside a detail).
 */
export declare function usePaneBarEdge(): VerticalBarEdge;
