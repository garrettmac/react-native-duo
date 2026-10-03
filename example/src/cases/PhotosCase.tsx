/**
 * `DuoBar` with every part your own: one list of items split across the navigation bar and the toolbar (`part`),
 * your button, your capsule, your More menu, a title, and a style per axis. On the closed iPhone Duo in landscape the
 * low-priority edits go to More first; Done never does.
 */
import {DuoBar, DuoPage, PaneLayout, useCameraClearance, useFold, usePage} from '@garrettmacmac/react-native-duo';
import {StyleSheet, Text, View} from 'react-native';

import {BarButton, Capsule, MoreMenu, type Action} from '../bars';
import {Body} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {shared, useSideInsetTop, type CaseProps} from './shared';

function photoActions(onClose: () => void): Action[] {
  return [
    {key: 'done', glyph: '✓', title: 'Done', icon: true, role: 'navigation', onPress: onClose},
    {key: 'share', glyph: '⇪', title: 'Share', icon: true, role: 'prominent'},
    {key: 'favorite', glyph: '♡', title: 'Favorite', icon: true, group: 'mark'},
    {key: 'info', glyph: 'ⓘ', title: 'Info', icon: true, group: 'mark'},
    {key: 'rotate', glyph: '⟳', title: 'Rotate', icon: true, bar: 'bottom', group: 'adjust', priority: 'low'},
    {key: 'crop', glyph: '⌗', title: 'Crop', icon: true, bar: 'bottom', group: 'adjust', priority: 'low'},
    {key: 'edit', glyph: '✎', title: 'Edit', icon: true, bar: 'bottom', group: 'edit'},
    {key: 'filters', glyph: '◐', title: 'Filters', icon: true, bar: 'bottom', group: 'edit', priority: 'low'},
    {key: 'trash', glyph: '🗑', title: 'Delete', icon: true, bar: 'bottom'},
  ];
}

function PhotoBar({part, items, insetTop}: {part: 'top' | 'bottom'; items: Action[]; insetTop: number}) {
  const colors = useColors();
  const clearance = useCameraClearance();
  const page = usePage();
  return (
    <DuoBar
      part={part}
      items={items}
      renderItem={(item, {vertical}) => <BarButton action={item} vertical={vertical} showTitle={false} />}
      renderGroup={(children, _group, {vertical}) => <Capsule vertical={vertical}>{children}</Capsule>}
      renderOverflow={(more, {vertical}) => (
        <Capsule vertical={vertical}>
          <MoreMenu items={more} vertical={vertical} edge={page.edge} />
        </Capsule>
      )}
      title={
        part === 'top' ? (
          <Text numberOfLines={1} style={[styles.title, {color: colors.text}]}>
            Saturday · 2:14 PM
          </Text>
        ) : undefined
      }
      itemLength={Layout.barItem + Spacing.sm}
      insetTop={insetTop}
      insetBottom={clearance.bottom}
      style={styles.gap}
      horizontalStyle={part === 'top' ? [shared.navBar, {paddingTop: insetTop, borderColor: colors.border}] : [styles.toolbar, {borderColor: colors.border}]}
      verticalStyle={styles.standing}
    />
  );
}

function Photo() {
  const colors = useColors();
  return (
    <View style={[shared.center, {backgroundColor: colors.map}]}>
      <View style={[styles.photo, {backgroundColor: colors.water}]}>
        <Text style={styles.photoGlyph}>🏔</Text>
      </View>
    </View>
  );
}

function Details() {
  return (
    <View style={shared.content}>
      <Body>Mountain lake</Body>
      <Body muted>Saturday · 2:14 PM · 12 MP</Body>
    </View>
  );
}

/** Partly folded, the photo takes one side of the fold and its details the other; otherwise the photo has it all. */
function Viewer() {
  const fold = useFold();
  if (fold) return <PaneLayout arrangement="side-by-side" leading={<Photo />} trailing={<Details />} />;
  return (
    <View style={shared.fill}>
      <Photo />
      <Details />
    </View>
  );
}

export function PhotosCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  const sideInsetTop = useSideInsetTop(insetTop);
  const items = photoActions(onClose);
  return (
    <DuoPage
      topBar={({vertical}) => <PhotoBar part="top" items={items} insetTop={vertical ? sideInsetTop : insetTop} />}
      bottomBar={<PhotoBar part="bottom" items={items} insetTop={sideInsetTop} />}
      sideInsetTop={sideInsetTop}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <Viewer />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  gap: {gap: Spacing.sm},
  title: {fontSize: Type.title, fontWeight: '600', textAlign: 'center'},
  toolbar: {paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth},
  standing: {gap: Spacing.sm},
  photo: {width: '80%', maxHeight: '90%', aspectRatio: 4 / 3, borderRadius: Radii.lg, alignItems: 'center', justifyContent: 'center'},
  photoGlyph: {fontSize: Type.display * 2},
});
