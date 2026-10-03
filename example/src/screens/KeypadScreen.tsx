/**
 * Calculator's keypad, the way Apple reflows it: four columns of five keys in a tall pane, five columns of four on
 * the closed iPhone Duo's squarer display. The keys follow the pane's shape, never the device. Partly folded, the
 * display and the keys take one side of the fold each, the way Calculator does in tabletop.
 */
import {PaneLayout, useFold, usePane} from '@garrettmacmac/react-native-duo';
import {StyleSheet, Text, View} from 'react-native';

import {Layout, Spacing, Type, useColors} from '../theme';

const TALL = ['⌫', 'AC', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '='];
const SQUARE = ['7', '8', '9', '⌫', '÷', '4', '5', '6', 'AC', '×', '1', '2', '3', '%', '−', '±', '0', '.', '=', '+'];
const OPERATORS = new Set(['÷', '×', '−', '+', '=']);

function Display() {
  const colors = useColors();
  return <Text style={[styles.display, {color: colors.text}]}>0</Text>;
}

function Keys({share}: {share: number}) {
  const colors = useColors();
  const {width, height} = usePane();
  const square = height / width < Layout.squareAspect;
  const columns = square ? 5 : 4;
  const keys = square ? SQUARE : TALL;
  const rows = keys.length / columns;
  const size = Math.min((width - Layout.gutter * 2 - Spacing.md * (columns - 1)) / columns, (height * share - Layout.gutter * 2 - Spacing.md * rows) / rows);
  return (
    <>
      <View style={[styles.keys, {width: size * columns + Spacing.md * (columns - 1)}]}>
        {keys.map(key => (
          <View key={key} style={[styles.key, {width: size, height: size, borderRadius: size / 2, backgroundColor: OPERATORS.has(key) ? colors.accent : colors.raised}]}>
            <Text style={[styles.label, {color: OPERATORS.has(key) ? colors.onAccent : colors.text}]}>{key}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.caption, {color: colors.muted}]}>{columns} columns for this pane’s shape</Text>
    </>
  );
}

export function KeypadScreen() {
  const fold = useFold();
  if (fold) {
    return (
      <PaneLayout
        arrangement="side-by-side"
        leading={
          <View style={styles.fill}>
            <Display />
          </View>
        }
        trailing={
          <View style={[styles.fill, styles.center]}>
            <Keys share={1} />
          </View>
        }
      />
    );
  }
  return (
    <View style={styles.fill}>
      <Display />
      <Keys share={Layout.keypadShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: Layout.gutter, gap: Spacing.md},
  display: {alignSelf: 'stretch', textAlign: 'right', fontSize: Type.display + Type.display, fontWeight: '300'},
  keys: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  key: {alignItems: 'center', justifyContent: 'center'},
  label: {fontSize: Type.heading, fontWeight: '500'},
  caption: {fontSize: Type.caption},
  center: {justifyContent: 'center'},
});
