/**
 * `PaneLayout` with the sidebar sized and styled: `leadingFraction`, `minLeadingWidth` and `maxLeadingWidth` set the
 * list's width beside its detail where there is no fold (an iPad, a wide window); `leadingStyle` and `trailingStyle`
 * draw each pane. An active fold still divides, so the open iPhone Duo puts each on its own display.
 */
import {DuoPage, PaneLayout, useEvenColumns, usePane, useSplitWindow} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {NavBar} from '../bars';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

const LOCATIONS = ['Recents', 'iCloud Drive', 'On My iPhone', 'Shared', 'Downloads'];
const FILES = ['Report.pdf', 'Budget.pdf', 'Lake.jpg', 'Groceries.txt', 'Recipe.pdf', 'Map.png', 'Receipt.pdf', 'Notes.txt'];

function Locations({current, onPick}: {current: string | null; onPick: (location: string) => void}) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={styles.locations}>
      {LOCATIONS.map(location => (
        <Pressable
          key={location}
          accessibilityRole="button"
          onPress={() => onPick(location)}
          style={[styles.location, location === current && {backgroundColor: colors.accent}]}>
          <Text style={[styles.locationLabel, {color: location === current ? colors.onAccent : colors.text}]}>{location}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Grid() {
  const colors = useColors();
  const {width} = usePane();
  const columns = useEvenColumns(Layout.cellMin, {gap: Spacing.md, inset: Layout.gutter * 2});
  const cell = (width - Layout.gutter * 2 - Spacing.md * (columns - 1)) / columns;
  return (
    <ScrollView contentContainerStyle={[shared.content, styles.grid]}>
      {FILES.map(file => (
        <View key={file} style={[styles.file, {width: cell, backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={styles.fileGlyph}>📄</Text>
          <Text numberOfLines={1} style={[styles.fileLabel, {color: colors.text}]}>
            {file}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function FilesCase({onClose, insetTop, params}: CaseProps) {
  const colors = useColors();
  const [location, setLocation] = useState<string | null>(params.get('location') ?? 'Recents');
  const split = useSplitWindow();
  return (
    <DuoPage
      topBarStyle={{paddingTop: insetTop}}
      topBar={placement => (
        <NavBar
          placement={placement}
          leading={[closeAction(onClose), ...(location && !split ? [{key: 'back', glyph: '‹', title: 'Browse', icon: true, onPress: () => setLocation(null)}] : [])]}
          title={placement.vertical ? undefined : split ? 'Files' : (location ?? 'Browse')}
          trailing={[{key: 'add', glyph: '+', title: 'New folder', icon: true, role: 'prominent'}]}
        />
      )}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <PaneLayout
        arrangement="list-detail"
        compact={location ? 'trailing' : 'leading'}
        leadingFraction={Layout.sidebarFraction}
        minLeadingWidth={Layout.sidebarMin}
        maxLeadingWidth={Layout.sidebarMax}
        leadingStyle={{backgroundColor: colors.raised}}
        trailingStyle={{backgroundColor: colors.background}}
        leading={<Locations current={location} onPick={setLocation} />}
        trailing={<Grid />}
      />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  locations: {padding: Spacing.sm, gap: Spacing.xs},
  location: {minHeight: Layout.tapTarget, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radii.md},
  locationLabel: {fontSize: Type.body, fontWeight: '600'},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  file: {borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: Spacing.xs, alignItems: 'center'},
  fileGlyph: {fontSize: Type.display},
  fileLabel: {fontSize: Type.caption, fontWeight: '600'},
});
