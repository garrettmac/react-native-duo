/** Which edge, if any, a pane's bars stand on: shared by `DuoPage`, `useVerticalBar` and `useBarInsets`. */
import {createContext, useContext} from 'react';
import {I18nManager} from 'react-native';

import {useDuo} from './context';
import {usePane} from './pane';
import type {Rect, VerticalBarEdge} from './types';

/** How a page draws its bars: in place, in its own strip, or in the strip of the page around it. */
export type PageMode = 'horizontal' | 'side' | 'hosted';

export interface PagePlacement {
  mode: PageMode;
  /** True when this page's bars stand on the side, in its own strip or the one around it. */
  vertical: boolean;
  edge: VerticalBarEdge;
}

export const PageContext = createContext<PagePlacement | null>(null);

const TOLERANCE = 1;

/** Whether `box` reaches the top of `within` and its side on `edge`, in physical points (right to left aware). */
export function touchesEdge(box: Rect, within: Rect, edge: 'leading' | 'trailing', rtl: boolean): boolean {
  if (box.y > within.y + TOLERANCE) return false;
  const right = (edge === 'trailing') !== rtl;
  return right ? box.x + box.width >= within.x + within.width - TOLERANCE : box.x <= within.x + TOLERANCE;
}

/**
 * The edge this pane's bars stand on: the page's, inside a `DuoPage`; otherwise the system's edge when the pane
 * reaches the top of the window and that side of it, and none for a pane elsewhere (the list beside a detail).
 */
export function usePaneBarEdge(): VerticalBarEdge {
  const page = useContext(PageContext);
  const {verticalBarEdge, window} = useDuo();
  const pane = usePane();
  if (page) return page.edge;
  if (verticalBarEdge === null) return null;
  return touchesEdge(pane, {x: 0, y: 0, width: window.width, height: window.height}, verticalBarEdge, I18nManager.isRTL) ? verticalBarEdge : null;
}
