/**
 * The example's tab bar inside `DuoPage`: a row of tabs at the bottom on a phone, a capsule at the bottom of the
 * side strip where the system stands bars on the side, with the tabs that do not fit in one More menu. Each demo's
 * own bar is a nested `DuoPage`, so it joins the same strip.
 */
import {DuoPage, useCameraClearance, usePane, type BarPlacement} from '@garrettmacmac/react-native-duo';
import {useState, type ReactNode} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {BarButton, Capsule, type Action} from './bars';
import {Layout, Radii, Spacing, Type, useColors} from './theme';

export interface Demo {
  key: string;
  glyph: string;
  title: string;
}

interface ShellProps {
  demos: readonly Demo[];
  current: string;
  onPick: (key: string) => void;
  insetTop: number;
  children: ReactNode;
}

/** How many tabs stand in the strip: at most half of it, so the screen's own bar keeps the other half. */
export function tabSlots(height: number, insetTop: number): number {
  return Math.max(2, Math.floor((height - insetTop) / 2 / Layout.barItem));
}

/** The length the standing tab bar takes, for a screen bar sharing the strip. */
export function tabBarLength(height: number, insetTop: number): number {
  return tabSlots(height, insetTop) * Layout.barItem + Spacing.lg;
}

function Tabs({placement, demos, current, onPick, insetTop}: {placement: BarPlacement} & Omit<ShellProps, 'children'>) {
  const colors = useColors();
  const {height} = usePane();
  const [moreOpen, setMoreOpen] = useState(false);
  const actions: Action[] = demos.map(demo => ({...demo, icon: true, selected: demo.key === current, onPress: () => onPick(demo.key)}));

  if (!placement.vertical) {
    return (
      <View style={[styles.tabRow, {borderColor: colors.border, backgroundColor: colors.surface}]}>
        {actions.map(action => (
          <Pressable key={action.key} accessibilityRole="button" accessibilityLabel={action.title} accessibilityState={{selected: action.selected}} onPress={action.onPress} style={styles.tab}>
            <Text style={[styles.glyph, {color: action.selected ? colors.accent : colors.muted}]}>{action.glyph}</Text>
            <Text style={[styles.tabLabel, {color: action.selected ? colors.accent : colors.muted}]}>{action.title}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const fits = tabSlots(height, insetTop);
  const shown = actions.length > fits ? actions.slice(0, fits - 1) : actions;
  const more = actions.slice(shown.length);
  return (
    <View style={styles.sideTabs}>
      {moreOpen ? (
        <View style={[styles.menu, placement.edge === 'leading' ? styles.menuLeading : styles.menuTrailing, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          {more.map(action => (
            <Pressable
              key={action.key}
              accessibilityRole="menuitem"
              onPress={() => {
                setMoreOpen(false);
                action.onPress?.();
              }}
              style={styles.menuItem}>
              <Text style={[styles.glyph, {color: colors.text}]}>{action.glyph}</Text>
              <Text style={[styles.menuLabel, {color: colors.text}]}>{action.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Capsule vertical>
        {shown.map(action => (
          <BarButton key={action.key} action={action} vertical />
        ))}
        {more.length > 0 ? (
          <BarButton
            action={{key: 'more', glyph: '⋯', title: 'More', icon: true, selected: moreOpen || more.some(action => action.selected), onPress: () => setMoreOpen(open => !open)}}
            vertical
          />
        ) : null}
      </Capsule>
    </View>
  );
}

export function Shell({demos, current, onPick, insetTop, children}: ShellProps) {
  const colors = useColors();
  const clearance = useCameraClearance();
  const sideInsetTop = Math.max(insetTop, clearance.top);
  return (
    <DuoPage
      topBar={placement => (placement.vertical ? null : <View style={{height: insetTop}} />)}
      bottomBar={placement => <Tabs placement={placement} demos={demos} current={current} onPick={onPick} insetTop={sideInsetTop} />}
      sideInsetTop={sideInsetTop}
      sideStyle={[styles.strip, {backgroundColor: colors.background}]}>
      {children}
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  strip: {width: Layout.barWidth, gap: Spacing.sm, paddingBottom: Spacing.lg},
  tabRow: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth},
  tab: {alignItems: 'center', minWidth: Layout.tapTarget, minHeight: Layout.tapTarget, justifyContent: 'center'},
  tabLabel: {fontSize: Type.caption, fontWeight: '600'},
  sideTabs: {alignItems: 'center'},
  glyph: {fontSize: Type.title},
  menu: {position: 'absolute', bottom: 0, width: Layout.menuWidth, borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.xs, zIndex: 2},
  menuLeading: {start: Layout.barWidth},
  menuTrailing: {end: Layout.barWidth},
  menuItem: {minHeight: Layout.tapTarget, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg},
  menuLabel: {fontSize: Type.body, fontWeight: '600'},
});
