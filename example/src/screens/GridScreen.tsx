/** An even grid: 2 or 4 columns, so the fold falls between them. */
import {useEvenColumns} from '@garrettmacmac/react-native-duo';
import {StyleSheet, Text, View} from 'react-native';

import {Body, Page} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';

export function GridScreen() {
  const colors = useColors();
  const columns = useEvenColumns(Layout.cellMin, {gap: Spacing.md, inset: Layout.gutter * 2});
  return (
    <Page>
      <Body muted>{columns} columns in this pane.</Body>
      <View style={styles.grid}>
        {Array.from({length: 16}, (_, index) => (
          <View key={index} style={[styles.cell, {width: `${100 / columns}%`}]}>
            <View style={[styles.tile, {backgroundColor: colors.raised}]}>
              <Text style={[styles.number, {color: colors.text}]}>{index + 1}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.md / 2},
  cell: {padding: Spacing.md / 2},
  tile: {aspectRatio: 1, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center'},
  number: {fontSize: Type.display, fontWeight: '700'},
});
