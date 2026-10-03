/**
 * A bar that lays itself out by Apple's rules and draws every part with your components. Horizontal (a phone, a
 * pane away from the edge): navigation items at the start, the title, the rest at the end. Standing (the side strip):
 * navigation, then the prominent action, then the top bar's items at the top, the bottom bar's items at the bottom,
 * and what does not fit in one overflow. Items that share a `group` sit in one capsule either way.
 */
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type BarItem, type UseVerticalBarOptions } from './bar';
export interface DuoBarContext {
    vertical: boolean;
}
export interface DuoBarProps<T extends BarItem> extends Partial<UseVerticalBarOptions> {
    items: readonly T[];
    /** Your button for one item. */
    renderItem: (item: T, context: DuoBarContext) => ReactNode;
    /** Your capsule around a group; by default a view with `groupStyle`, a row or a column. */
    renderGroup?: (children: ReactNode, items: T[], context: DuoBarContext) => ReactNode;
    /** Your More menu for the items that do not fit. Without it, a bar that overflows warns once in development. */
    renderOverflow?: (items: T[], context: DuoBarContext) => ReactNode;
    /** Drawn between the two ends of a horizontal bar. Standing bars have no room for text: draw the title in the content. */
    title?: ReactNode;
    /** `auto` (the default) follows the pose and the page; `horizontal` or `vertical` forces one. */
    axis?: 'auto' | 'horizontal' | 'vertical';
    /**
     * Draws one half of a layout shared by two bars: pass the same `items` to a `top` bar and a `bottom` bar, and both
     * split them the same way. `top` draws the navigation bar's items and the overflow, `bottom` the toolbar's items.
     */
    part?: 'top' | 'bottom';
    style?: StyleProp<ViewStyle>;
    horizontalStyle?: StyleProp<ViewStyle>;
    verticalStyle?: StyleProp<ViewStyle>;
    groupStyle?: StyleProp<ViewStyle>;
    /** Wraps each item when given. */
    itemStyle?: StyleProp<ViewStyle>;
    testID?: string;
}
export declare const DUO_BAR_TESTID = "duo-bar";
export declare function DuoBar<T extends BarItem>({ items, renderItem, renderGroup, renderOverflow, title, axis, part, style, horizontalStyle, verticalStyle, groupStyle, itemStyle, itemLength, testID, ...options }: DuoBarProps<T>): import("react").JSX.Element;
