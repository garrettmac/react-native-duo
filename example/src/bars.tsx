/**
 * The example's bar buttons and capsules. One component draws a bar either way: a row with titles on a phone, a
 * column of symbols in the side strip, items that share a `group` in one capsule.
 */
import {barGroups, type BarItem, type BarPlacement} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Layout, Radii, Spacing, Type, useColors} from './theme';

export interface Action extends BarItem {
  glyph: string;
  title: string;
  onPress?: () => void;
  selected?: boolean;
}

export function BarButton({action, vertical, showTitle = !vertical}: {action: Action; vertical: boolean; showTitle?: boolean}) {
  const colors = useColors();
  const tint = action.selected ? colors.onAccent : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.title}
      accessibilityState={{selected: action.selected}}
      onPress={action.onPress}
      style={[styles.button, showTitle && styles.titled, action.selected && {backgroundColor: colors.accent}]}>
      <Text style={[styles.glyph, {color: tint}]}>{action.glyph}</Text>
      {showTitle ? <Text style={[styles.title, {color: tint}]}>{action.title}</Text> : null}
    </Pressable>
  );
}

export function Capsule({vertical, children}: {vertical: boolean; children: React.ReactNode}) {
  const colors = useColors();
  return <View style={[styles.capsule, vertical ? styles.column : styles.row, {backgroundColor: colors.surface, borderColor: colors.border}]}>{children}</View>;
}

/** A run of actions in capsules: a row on a phone, a column in the strip. */
export function Actions({actions, vertical, titles = false}: {actions: Action[]; vertical: boolean; titles?: boolean}) {
  return (
    <View style={[vertical ? styles.column : styles.row, styles.gap]}>
      {barGroups(actions).map(group => (
        <Capsule key={group[0].key} vertical={vertical}>
          {group.map(action => (
            <BarButton key={action.key} action={action} vertical={vertical} showTitle={titles && !vertical} />
          ))}
        </Capsule>
      ))}
    </View>
  );
}

/** A navigation bar: Back and the leading actions at the start, the title in the middle, the rest at the end. */
export function NavBar({placement, leading = [], trailing = [], title}: {placement: BarPlacement; leading?: Action[]; trailing?: Action[]; title?: string}) {
  const colors = useColors();
  if (placement.vertical) {
    return (
      <View style={[styles.column, styles.gap, styles.side]}>
        <Actions actions={[...leading, ...trailing]} vertical />
      </View>
    );
  }
  return (
    <View style={[styles.navBar, {borderColor: colors.border}]}>
      <View style={styles.end}>
        <Actions actions={leading} vertical={false} />
      </View>
      {title ? (
        <Text numberOfLines={1} style={[styles.navTitle, {color: colors.text}]}>
          {title}
        </Text>
      ) : (
        <View style={styles.fill} />
      )}
      <View style={[styles.end, styles.trailing]}>
        <Actions actions={trailing} vertical={false} />
      </View>
    </View>
  );
}

/** One More button for the items a bar has no room for; its menu opens beside the strip or under the bar. */
export function MoreMenu({items, vertical, edge = 'trailing'}: {items: Action[]; vertical: boolean; edge?: 'leading' | 'trailing' | null}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <BarButton action={{key: 'more', glyph: '⋯', title: 'More', icon: true, selected: open, onPress: () => setOpen(value => !value)}} vertical={vertical} />
      {open ? (
        <View
          style={[
            styles.menu,
            vertical ? (edge === 'leading' ? styles.menuBesideLeading : styles.menuBesideTrailing) : styles.menuBelow,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          {items.map(item => (
            <Pressable
              key={item.key}
              accessibilityRole="menuitem"
              onPress={() => {
                setOpen(false);
                item.onPress?.();
              }}
              style={styles.menuItem}>
              <Text style={[styles.glyph, {color: colors.text}]}>{item.glyph}</Text>
              <Text style={[styles.title, {color: colors.text}]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {position: 'absolute', width: Layout.menuWidth, borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.xs, zIndex: 2},
  menuBesideLeading: {top: 0, start: Layout.tapTarget + Spacing.sm},
  menuBesideTrailing: {top: 0, end: Layout.tapTarget + Spacing.sm},
  menuBelow: {top: Layout.tapTarget, end: 0},
  menuItem: {minHeight: Layout.tapTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg},
  fill: {flex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  column: {flexDirection: 'column', alignItems: 'center'},
  gap: {gap: Spacing.sm},
  side: {paddingVertical: Spacing.xs},
  button: {minWidth: Layout.tapTarget, minHeight: Layout.tapTarget, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.pill, flexDirection: 'row'},
  titled: {gap: Spacing.xs, paddingHorizontal: Spacing.md},
  glyph: {fontSize: Type.title},
  title: {fontSize: Type.body, fontWeight: '600'},
  capsule: {borderRadius: Radii.pill, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.xs / 2},
  navBar: {minHeight: Layout.tapTarget + Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth},
  end: {flexDirection: 'row', minWidth: Layout.tapTarget},
  trailing: {justifyContent: 'flex-end'},
  navTitle: {flex: 1, textAlign: 'center', fontSize: Type.title, fontWeight: '600'},
});
