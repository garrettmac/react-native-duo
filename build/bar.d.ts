import type { VerticalBarEdge } from './types';
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
export declare function barGroups<T extends BarItem>(items: readonly T[]): T[][];
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
export declare function verticalBarLayout<T extends BarItem>({ edge, items, length, itemLength, tabBarLength, minimizedTabBarLength, compression, }: VerticalBarInput<T>): VerticalBarLayout<T>;
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
export declare function useVerticalBar<T extends BarItem>(items: readonly T[], { itemLength, insetTop, insetBottom, ...rest }: UseVerticalBarOptions): VerticalBarLayout<T>;
