/**
 * `mode` and `onModeChange`. A drawing app keeps its tool palette on the side even on a phone (`mode="side"`), or
 * follows the pose (`auto`); `onModeChange` reports where the bars went, here shown on the canvas.
 */
import {AvoidReservedRegions, DuoPage, type BarPlacement, type PageMode} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Actions, type Action} from '../bars';
import {Button, Card} from '../components';
import {Layout, Radii, Spacing, Swatches, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

function Palette({placement, onClose}: {placement: BarPlacement; onClose: () => void}) {
  const colors = useColors();
  const [tool, setTool] = useState('pen');
  const tools: Action[] = ['pen:✎:Pen', 'marker:▮:Marker', 'eraser:⌫:Eraser', 'lasso:◌:Lasso'].map(spec => {
    const [key, glyph, title] = spec.split(':');
    return {key, glyph, title, icon: true, group: 'tools', selected: key === tool, onPress: () => setTool(key)};
  });
  return (
    <View style={[placement.vertical ? styles.column : [shared.navBar, {borderColor: colors.border}], styles.gap]}>
      <Actions actions={[closeAction(onClose), ...tools]} vertical={placement.vertical} />
      <View style={[placement.vertical ? styles.column : styles.row, styles.gap]}>
        {Swatches.map(color => (
          <View key={color} style={[styles.swatch, {backgroundColor: color}]} />
        ))}
      </View>
    </View>
  );
}

export function CanvasCase({onClose, insetTop, params}: CaseProps) {
  const colors = useColors();
  const [always, setAlways] = useState(params.get('mode') !== 'auto');
  const [mode, setMode] = useState<PageMode>('horizontal');
  return (
    <DuoPage
      mode={always ? 'side' : 'auto'}
      onModeChange={setMode}
      topBarStyle={{paddingTop: insetTop}}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}
      topBar={placement => <Palette placement={placement} onClose={onClose} />}>
      <View style={[shared.center, {backgroundColor: colors.surface}]}>
        <AvoidReservedRegions>
          <Card>
          <Text style={[styles.mode, {color: colors.text}]}>Bars: {mode}</Text>
          <Button label={always ? 'Follow the pose' : 'Always on the side'} onPress={() => setAlways(value => !value)} />
          </Card>
        </AvoidReservedRegions>
      </View>
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  column: {flexDirection: 'column', alignItems: 'center'},
  gap: {gap: Spacing.sm},
  swatch: {width: Layout.swatch, height: Layout.swatch, borderRadius: Radii.pill},
  mode: {fontSize: Type.title, fontWeight: '700', textAlign: 'center'},
});
