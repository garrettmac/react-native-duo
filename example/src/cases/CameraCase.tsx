/**
 * Bars the app draws itself, with no `DuoPage`: `useVerticalBarEdge` says which edge the controls stand on,
 * `useBarInsets` how far the viewfinder keeps clear of them, `AvoidReservedRegions` nudges the shutter off the fold
 * and the cameras, and `useCameraDirections` with `forwardCamera` and `shouldMirror` pick and mirror the camera that
 * faces the person, whichever display they hold.
 */
import {AvoidReservedRegions, forwardCamera, shouldMirror, useBarInsets, useCameraClearance, useCameraDirections, useVerticalBarEdge} from '@garrettmacmac/react-native-duo';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {BarButton} from '../bars';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, type CaseProps} from './shared';

export function CameraCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  const edge = useVerticalBarEdge();
  const insets = useBarInsets(Layout.shutter + Spacing.xl);
  const clearance = useCameraClearance();
  const directions = useCameraDirections();
  const camera = forwardCamera(directions);
  const mirrored = camera ? shouldMirror(camera, directions) : false;
  const standing = edge !== null;

  const controls = (
    <View
      style={[
        standing ? styles.column : styles.row,
        standing ? {paddingTop: Math.max(insetTop, clearance.top), paddingBottom: Math.max(clearance.bottom, Spacing.lg)} : {paddingBottom: Spacing.xl},
      ]}>
      <BarButton action={closeAction(onClose)} vertical={standing} showTitle={false} />
      <AvoidReservedRegions>
        <Pressable accessibilityRole="button" accessibilityLabel="Take photo" style={[styles.shutter, {borderColor: colors.onAccent}]}>
          <View style={[styles.shutterInner, {backgroundColor: colors.onAccent}]} />
        </Pressable>
      </AvoidReservedRegions>
      <BarButton action={{key: 'flip', glyph: '⟲', title: 'Switch camera', icon: true}} vertical={standing} showTitle={false} />
    </View>
  );

  return (
    <View style={[styles.fill, {backgroundColor: colors.background}]}>
      <View style={[styles.viewfinder, {marginStart: insets.leading, marginEnd: insets.trailing, marginTop: insetTop, backgroundColor: colors.water}]}>
        <Text style={[styles.label, {color: colors.text}]}>
          {camera ? `${camera.localizedName}${mirrored ? ', mirrored' : ''}` : `No camera direction here (${directions.source})`}
        </Text>
        <Text style={[styles.label, {color: colors.text}]}>Controls: {edge ?? 'bottom'}</Text>
      </View>
      <View style={[styles.controls, standing ? (edge === 'leading' ? styles.leading : styles.trailing) : styles.bottom, {backgroundColor: colors.scrim}]}>{controls}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  viewfinder: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: Radii.md},
  label: {fontSize: Type.body, fontWeight: '600'},
  controls: {position: 'absolute'},
  bottom: {start: 0, end: 0, bottom: 0},
  leading: {start: 0, top: 0, bottom: 0, width: Layout.shutter + Spacing.xl},
  trailing: {end: 0, top: 0, bottom: 0, width: Layout.shutter + Spacing.xl},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: Spacing.lg},
  column: {flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'},
  shutter: {width: Layout.shutter, height: Layout.shutter, borderRadius: Radii.pill, borderWidth: Spacing.xs, alignItems: 'center', justifyContent: 'center'},
  shutterInner: {width: Layout.shutter - Spacing.lg, height: Layout.shutter - Spacing.lg, borderRadius: Radii.pill},
});
