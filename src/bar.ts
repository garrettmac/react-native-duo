/**
 * Where bar items go when the system stands bars on the side: Apple's vertical-bar rules for an app whose bars are
 * its own views. Back or Close at the top, then the prominent action, then the top bar's items; the bottom bar's
 * items at the bottom; items that cannot stand (text-only, `horizontalOnly`) stay in a horizontal bar; what does not
 * fit goes to one overflow menu, lowest priority first and bottom to top among equals.
 */
import {useMemo} from 'react';

import {usePaneBarEdge} from './page-context';
import {usePane} from './pane';
import type {VerticalBarEdge} from './types';

export type BarItemRole = 'navigation' | 'prominent' | 'standard';
export type BarItemAxisBehavior = 'automatic' | 'horizontalOnly' | 'verticalPreferred';
export type BarItemPriority = 'high' | 'standard' | 'low' | number;
export type VerticalBarCompression = 'automatic' | 'prefersBarItems' | 'prefersTabBar';

export interface BarItem {
  key: string;
  /** `navigation` is Back or Close and never overflows; `prominent` is Done, Share, Compose. */
  role?: BarItemRole;
  /** Which horizontal bar the item lives in on a phone: the top (navigation) bar or the bottom toolbar. */
  bar?: 'top' | 'bottom';
  /** True when the item has a symbol. An item without one cannot stand vertical. */
  icon?: boolean;
  /** The item's title, shown in overflow menus and horizontal bars; every item should have one. */
  title?: string;
  priority?: BarItemPriority;
  axisBehavior?: BarItemAxisBehavior;
  /** Items next to each other with the same group share one capsule, like Reply, Reply All and Forward in Mail. */
  group?: string;
}

/** Splits a laid-out run of items into capsules: neighbours with the same `group` together, every other item alone. */
export function barGroups<T extends BarItem>(items: readonly T[]): T[][] {
  const groups: T[][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && item.group !== undefined && last[0].group === item.group) last.push(item);
    else groups.push([item]);
  }
  return groups;
}

export interface VerticalBarInput<T extends BarItem> {
  edge: VerticalBarEdge;
  items: readonly T[];
  /** The bar's usable length in points: the pane's height less the status bar and anything else that shares the strip. */
  length: number;
  /** The length one item takes, gap included. */
  itemLength: number;
  /** The tab bar's length on the strip when the screen has one; 0 or undefined when it has none. */
  tabBarLength?: number;
  /** The tab bar's length when minimized. */
  minimizedTabBarLength?: number;
  /** `prefersTabBar` (navigation screens, the default) overflows bar items first; `prefersBarItems` (task screens) minimizes the tab bar first. */
  compression?: VerticalBarCompression;
}

export interface VerticalBarLayout<T extends BarItem> {
  axis: 'vertical' | 'horizontal';
  edge: VerticalBarEdge;
  /** Top of the strip, in order: navigation, prominent, then the top bar's items. */
  top: T[];
  /** Bottom of the strip, in order. */
  bottom: T[];
  /** Items that stay in a horizontal bar at the top of the screen; with no vertical edge, every item. */
  horizontal: T[];
  /** Items for the one overflow menu (draw each with its symbol and title). */
  overflow: T[];
  tabBar: 'full' | 'minimized' | 'none';
}

const PRIORITY: Record<'high' | 'standard' | 'low', number> = {high: 750, standard: 500, low: 250};

function priorityOf(item: BarItem): number {
  if (item.role === 'navigation') return Number.POSITIVE_INFINITY;
  const value = item.priority ?? 'standard';
  return typeof value === 'number' ? value : PRIORITY[value];
}

function canStand(item: BarItem): boolean {
  return item.icon === true && item.axisBehavior !== 'horizontalOnly';
}

const ROLE_ORDER: Record<BarItemRole, number> = {navigation: 0, prominent: 1, standard: 2};

function topOrder(items: readonly BarItem[]): BarItem[] {
  return items
    .map((item, index) => ({item, index}))
    .sort((a, b) => ROLE_ORDER[a.item.role ?? 'standard'] - ROLE_ORDER[b.item.role ?? 'standard'] || a.index - b.index)
    .map(({item}) => item);
}

export function verticalBarLayout<T extends BarItem>({
  edge,
  items,
  length,
  itemLength,
  tabBarLength = 0,
  minimizedTabBarLength = itemLength,
  compression = 'automatic',
}: VerticalBarInput<T>): VerticalBarLayout<T> {
  const hasTabBar = tabBarLength > 0;
  if (edge === null) return {axis: 'horizontal', edge, top: [], bottom: [], horizontal: [...items], overflow: [], tabBar: hasTabBar ? 'full' : 'none'};

  const horizontal = items.filter(item => !canStand(item));
  const standing = items.filter(canStand);
  let top = topOrder(standing.filter(item => item.role === 'navigation' || item.role === 'prominent' || item.bar !== 'bottom')) as T[];
  let bottom = standing.filter(item => !top.includes(item));
  const overflow: T[] = [];

  const room = (tabBar: number, overflowSlot: boolean) => Math.floor((length - tabBar) / itemLength) - (overflowSlot ? 1 : 0);
  const count = () => top.length + bottom.length;

  let tabBar: VerticalBarLayout<T>['tabBar'] = hasTabBar ? 'full' : 'none';
  const minimizeFirst = compression === 'prefersBarItems';
  if (hasTabBar && minimizeFirst && count() > room(tabBarLength, false)) tabBar = 'minimized';
  const tabLength = () => (tabBar === 'full' ? tabBarLength : tabBar === 'minimized' ? minimizedTabBarLength : 0);

  while (count() > room(tabLength(), overflow.length > 0)) {
    const stack = [...top, ...bottom];
    let victim: T | null = null;
    for (let i = stack.length - 1; i >= 0; i--) {
      const item = stack[i];
      if (item.role === 'navigation') continue;
      if (victim === null || priorityOf(item) < priorityOf(victim)) victim = item;
    }
    if (victim === null) {
      if (hasTabBar && tabBar === 'full') {
        tabBar = 'minimized';
        continue;
      }
      break;
    }
    overflow.unshift(victim);
    top = top.filter(item => item !== victim);
    bottom = bottom.filter(item => item !== victim);
  }

  return {axis: 'vertical', edge, top, bottom, horizontal, overflow, tabBar};
}

export interface UseVerticalBarOptions {
  itemLength: number;
  /** Points at the top of the strip the bar never claims: the status bar and the Dynamic Island. */
  insetTop?: number;
  insetBottom?: number;
  tabBarLength?: number;
  minimizedTabBarLength?: number;
  compression?: VerticalBarCompression;
}

/** `verticalBarLayout` for the pane this bar is in, re-run on every pose change. */
export function useVerticalBar<T extends BarItem>(items: readonly T[], {itemLength, insetTop = 0, insetBottom = 0, ...rest}: UseVerticalBarOptions): VerticalBarLayout<T> {
  const edge = usePaneBarEdge();
  const {height} = usePane();
  const {tabBarLength, minimizedTabBarLength, compression} = rest;
  return useMemo(
    () => verticalBarLayout({edge, items, length: height - insetTop - insetBottom, itemLength, tabBarLength, minimizedTabBarLength, compression}),
    [edge, items, height, insetTop, insetBottom, itemLength, tabBarLength, minimizedTabBarLength, compression],
  );
}
