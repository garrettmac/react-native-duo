/**
 * A bar that lays itself out by Apple's rules and draws every part with your components. Horizontal (a phone, a
 * pane away from the edge): navigation items at the start, the title, the rest at the end. Standing (the side strip):
 * navigation, then the prominent action, then the top bar's items at the top, the bottom bar's items at the bottom,
 * and what does not fit in one overflow. Items that share a `group` sit in one capsule either way.
 */
import {Fragment, useRef, type ReactNode} from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {barGroups, useVerticalBar, type BarItem, type UseVerticalBarOptions} from './bar';

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

export const DUO_BAR_TESTID = 'duo-bar';

const DEFAULT_ITEM_LENGTH = 52;

export function DuoBar<T extends BarItem>({
  items,
  renderItem,
  renderGroup,
  renderOverflow,
  title,
  axis = 'auto',
  part,
  style,
  horizontalStyle,
  verticalStyle,
  groupStyle,
  itemStyle,
  itemLength = DEFAULT_ITEM_LENGTH,
  testID = DUO_BAR_TESTID,
  ...options
}: DuoBarProps<T>) {
  const layout = useVerticalBar(items, {itemLength, ...options});
  const vertical = axis === 'auto' ? layout.axis === 'vertical' : axis === 'vertical';
  const context: DuoBarContext = {vertical};
  const warned = useRef(false);

  const item = (entry: T) => <Fragment key={entry.key}>{itemStyle ? <View style={itemStyle}>{renderItem(entry, context)}</View> : renderItem(entry, context)}</Fragment>;
  const groups = (run: readonly T[]) =>
    barGroups(run).map(group => {
      const children = group.map(item);
      return (
        <Fragment key={group[0].key}>
          {renderGroup ? renderGroup(children, group, context) : <View style={[vertical ? styles.column : styles.row, groupStyle]}>{children}</View>}
        </Fragment>
      );
    });

  const overflow = vertical && part !== 'bottom' ? layout.overflow : [];
  if (overflow.length > 0 && !renderOverflow && !warned.current && process.env.NODE_ENV !== 'production') {
    warned.current = true;
    console.warn(`DuoBar: ${overflow.length} item(s) do not fit and no renderOverflow was given.`);
  }

  if (vertical) {
    const standing = layout.axis === 'vertical' ? layout : {top: items.filter(entry => entry.bar !== 'bottom'), bottom: items.filter(entry => entry.bar === 'bottom'), horizontal: []};
    return (
      <View testID={testID} style={[styles.column, style, verticalStyle]}>
        {part !== 'bottom' ? groups(standing.top) : null}
        {overflow.length > 0 && renderOverflow ? renderOverflow(overflow, context) : null}
        {part === undefined ? <View style={styles.fill} /> : null}
        {part !== 'top' ? groups(standing.bottom) : null}
      </View>
    );
  }

  const shown = part === undefined ? items : items.filter(entry => (entry.bar === 'bottom') === (part === 'bottom'));
  const leading = shown.filter(entry => entry.role === 'navigation');
  const trailing = [...shown.filter(entry => entry.role !== 'navigation' && entry.role !== 'prominent'), ...shown.filter(entry => entry.role === 'prominent')];
  return (
    <View testID={testID} style={[styles.row, style, horizontalStyle]}>
      <View style={styles.row}>{groups(leading)}</View>
      <View style={styles.fill}>{title}</View>
      <View style={styles.row}>{groups(trailing)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  column: {flexDirection: 'column', alignItems: 'center'},
});
