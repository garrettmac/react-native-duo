/** The advanced cases: each opens over the demos as a screen of its own, the way an app would use the API. */
import {useEvenColumns, usePane} from '@garrettmacmac/react-native-duo';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {CASES} from '../cases';
import {Body, Title} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';

export function CasesScreen({onOpen}: {onOpen: (key: string) => void}) {
  const colors = useColors();
  const {width} = usePane();
  const columns = useEvenColumns(Layout.cellMin * 1.5, {gap: Spacing.md, inset: Layout.gutter * 2});
  const cell = (width - Layout.gutter * 2 - Spacing.md * (columns - 1)) / columns;
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Title>Advanced cases</Title>
      <Body muted>Each one is a whole screen built on one part of the API. Open it, then change the pose below.</Body>
      <View style={styles.grid}>
        {CASES.map(entry => (
          <Pressable
            key={entry.key}
            accessibilityRole="button"
            onPress={() => onOpen(entry.key)}
            style={[styles.card, {width: cell, backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[styles.title, {color: colors.text}]}>{entry.title}</Text>
            <Text style={[styles.api, {color: colors.accent}]}>{entry.api}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {padding: Layout.gutter, gap: Spacing.md},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  card: {minHeight: Layout.tapTarget * 2, borderRadius: Radii.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.lg, gap: Spacing.xs},
  title: {fontSize: Type.title, fontWeight: '700'},
  api: {fontSize: Type.caption, fontWeight: '600'},
});
