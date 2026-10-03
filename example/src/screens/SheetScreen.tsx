/**
 * A custom sheet that follows the pose: full width closed with its controls standing on the bar edge, centered or to
 * one side open, beside the fold when partly folded. `useSheetPose` places it in window points, so the sheet covers
 * the whole window from wherever it is mounted.
 */
import {useSheetPose, type SheetPlacementPreference, type VerticalBarBehavior} from '@garrettmacmac/react-native-duo';
import {rowSidePadding, useArrangementBox} from '@garrettmacmac/react-native-duo/layout';
import {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Body, Button, Card, Page, Title} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';

const PLACEMENTS: SheetPlacementPreference[] = ['automatic', 'leading', 'center', 'trailing'];

function Control({glyph, title, prominent = false, vertical, onPress}: {glyph: string; title: string; prominent?: boolean; vertical: boolean; onPress: () => void}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[styles.control, vertical && styles.round, {backgroundColor: prominent ? colors.accent : colors.raised}]}>
      <Text style={[styles.controlLabel, {color: prominent ? colors.onAccent : colors.text}]}>{vertical ? glyph : title}</Text>
    </Pressable>
  );
}

function Sheet({placement, behavior, onClose}: {placement: SheetPlacementPreference; behavior: VerticalBarBehavior; onClose: () => void}) {
  const colors = useColors();
  const pose = useSheetPose({placement, verticalBarBehavior: behavior, topGap: Spacing.xxl});
  const {ref, onLayout, origin} = useArrangementBox();
  const {x, width, height} = pose.placement;
  const row = rowSidePadding(pose.clearance, pose.placement, pose.window.width, Spacing.lg);
  const controls = (
    <>
      <Control glyph="✕" title="Close" vertical={pose.vertical} onPress={onClose} />
      <Control glyph="✓" title="Done" prominent vertical={pose.vertical} onPress={onClose} />
    </>
  );

  return (
    <View ref={ref} onLayout={onLayout} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.window, {left: -origin.x, top: -origin.y, width: pose.window.width, height: pose.window.height, backgroundColor: colors.scrim}]}>
        <View
          style={[
            styles.panel,
            {left: x, width, height: height ?? undefined, backgroundColor: colors.surface, borderColor: colors.border},
            pose.vertical && {flexDirection: pose.edge === 'trailing' ? 'row-reverse' : 'row'},
          ]}>
          {pose.vertical ? (
            <View style={[styles.verticalControls, {borderColor: colors.border}]}>{controls}</View>
          ) : (
            <View style={[styles.horizontalControls, row]}>{controls}</View>
          )}
          <View style={styles.content}>
            <Text style={[styles.heading, {color: colors.text}]}>Sheet</Text>
            <Body muted>
              {pose.placement.side} placement, controls {pose.vertical ? 'standing on the side' : 'in a row'}.
            </Body>
          </View>
        </View>
      </View>
    </View>
  );
}

export function SheetScreen() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<SheetPlacementPreference>('automatic');
  const [behavior, setBehavior] = useState<VerticalBarBehavior>('automatic');
  return (
    <View style={styles.fill}>
      <Page>
        <Card>
          <Title>Placement</Title>
          <View style={styles.options}>
            {PLACEMENTS.map(option => (
              <Button key={option} label={option} selected={option === placement} onPress={() => setPlacement(option)} />
            ))}
          </View>
          <Title>Vertical bar</Title>
          <View style={styles.options}>
            {(['automatic', 'disabled'] as const).map(option => (
              <Button key={option} label={option} selected={option === behavior} onPress={() => setBehavior(option)} />
            ))}
          </View>
        </Card>
        <Button label="Open the sheet" selected onPress={() => setOpen(true)} />
      </Page>
      {open ? <Sheet placement={placement} behavior={behavior} onClose={() => setOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  options: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  window: {position: 'absolute'},
  panel: {position: 'absolute', bottom: 0, borderTopLeftRadius: Radii.lg, borderTopRightRadius: Radii.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden'},
  verticalControls: {width: Layout.barWidth, alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm, borderStartWidth: StyleSheet.hairlineWidth, borderEndWidth: StyleSheet.hairlineWidth},
  horizontalControls: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md},
  control: {minHeight: Layout.tapTarget, minWidth: Layout.tapTarget, paddingHorizontal: Spacing.lg, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center'},
  round: {paddingHorizontal: 0},
  controlLabel: {fontSize: Type.body, fontWeight: '600'},
  content: {flex: 1, padding: Layout.gutter, gap: Spacing.sm},
  heading: {fontSize: Type.heading, fontWeight: '700'},
});
