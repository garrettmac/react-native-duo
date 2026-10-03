/** A list over a map: layered on a phone, side by side on the open Duo and iPad, either side of the fold. */
import {PaneLayout, usePane} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {Layout, Radii, Spacing, Type, useColors} from '../theme';

const PLACES = ['Coffee shop', 'Library', 'Park', 'Museum', 'Bakery', 'Bookstore', 'Market', 'Gym'];

function FakeMap({picked}: {picked: string}) {
  const colors = useColors();
  return (
    <View style={[styles.fill, {backgroundColor: colors.water}]}>
      <View style={[styles.land, {backgroundColor: colors.map}]} />
      <View style={[styles.pin, {backgroundColor: colors.accent}]}>
        <Text style={[styles.pinLabel, {color: colors.onAccent}]}>{picked}</Text>
      </View>
    </View>
  );
}

function PlaceSheet({picked, onPick}: {picked: string; onPick: (place: string) => void}) {
  const colors = useColors();
  const pane = usePane();
  const docked = pane.split;
  return (
    <View pointerEvents="box-none" style={[styles.fill, !docked && styles.overlay]}>
      <View style={[docked ? styles.docked : styles.card, {backgroundColor: colors.surface, borderColor: colors.border}, !docked && {maxHeight: pane.height / 2, width: Math.min(pane.width - Spacing.sm * 2, Layout.sheetMax), alignSelf: 'center'}]}>
        <Text style={[styles.heading, {color: colors.text}]}>Places</Text>
        <ScrollView>
          {PLACES.map(place => (
            <Pressable key={place} accessibilityRole="button" onPress={() => onPick(place)} style={[styles.place, place === picked && {backgroundColor: colors.raised}]}>
              <Text style={[styles.placeLabel, {color: colors.text}]}>{place}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function MapScreen() {
  const [picked, setPicked] = useState(PLACES[0]);
  return <PaneLayout arrangement="sheet" leading={<FakeMap picked={picked} />} trailing={<PlaceSheet picked={picked} onPick={setPicked} />} />;
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  overlay: {justifyContent: 'flex-end', padding: Spacing.sm},
  land: {position: 'absolute', top: '15%', start: '10%', width: '70%', height: '55%', borderRadius: Radii.lg * 4},
  pin: {position: 'absolute', top: '40%', start: '35%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.pill},
  pinLabel: {fontSize: Type.body, fontWeight: '700'},
  card: {borderRadius: Radii.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.lg},
  docked: {flex: 1, padding: Layout.gutter, borderStartWidth: StyleSheet.hairlineWidth},
  heading: {fontSize: Type.heading, fontWeight: '700', marginBottom: Spacing.sm},
  place: {minHeight: Layout.tapTarget, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radii.sm},
  placeLabel: {fontSize: Type.title},
});
