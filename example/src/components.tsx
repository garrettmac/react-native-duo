/** The few building blocks every example screen composes. */
import type {ReactNode} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle} from 'react-native';

import {Layout, Radii, Spacing, Type, useColors} from './theme';

export function Title({children}: {children: ReactNode}) {
  const colors = useColors();
  return <Text style={[styles.title, {color: colors.text}]}>{children}</Text>;
}

export function Body({children, muted = false}: {children: ReactNode; muted?: boolean}) {
  const colors = useColors();
  return <Text style={[styles.body, {color: muted ? colors.muted : colors.text}]}>{children}</Text>;
}

export function Card({children, style}: {children: ReactNode; style?: StyleProp<ViewStyle>}) {
  const colors = useColors();
  return <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}, style]}>{children}</View>;
}

export function Button({label, onPress, selected = false}: {label: string; onPress: () => void; selected?: boolean}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={[styles.button, {backgroundColor: selected ? colors.accent : colors.raised}]}>
      <Text style={[styles.buttonLabel, {color: selected ? colors.onAccent : colors.text}]}>{label}</Text>
    </Pressable>
  );
}

export function Page({children}: {children: ReactNode}) {
  return <ScrollView contentContainerStyle={styles.page}>{children}</ScrollView>;
}

export function Row({label, value}: {label: string; value: string}) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.body, {color: colors.muted}]}>{label}</Text>
      <Text style={[styles.body, styles.value, {color: colors.text}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {fontSize: Type.heading, fontWeight: '700', marginBottom: Spacing.sm},
  body: {fontSize: Type.body, lineHeight: Type.body * 1.4},
  card: {borderRadius: Radii.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.lg, gap: Spacing.sm},
  button: {minHeight: Layout.tapTarget, borderRadius: Radii.pill, paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center'},
  buttonLabel: {fontSize: Type.body, fontWeight: '600'},
  page: {padding: Layout.gutter, gap: Layout.section},
  row: {flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md},
  value: {fontWeight: '600', flexShrink: 1, textAlign: 'right'},
});
