/**
 * `renderSide`: the whole strip drawn by the app. It receives what would go in it (this page's bars and any nested
 * page's, top and bottom) and the room to keep free, and adds what only the strip shows: here the album art above the
 * transport, and a border on whichever side faces the content.
 */
import {DuoPage, PaneLayout, useFold, usePane, type BarPlacement} from '@garrettmacmac/react-native-duo';
import {StyleSheet, Text, View} from 'react-native';

import {Actions, NavBar, type Action} from '../bars';
import {Body, Title} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

function Transport({placement}: {placement: BarPlacement}) {
  const colors = useColors();
  const actions: Action[] = [
    {key: 'previous', glyph: '⏮', title: 'Previous', icon: true, group: 'transport'},
    {key: 'play', glyph: '⏸', title: 'Pause', icon: true, group: 'transport', selected: true},
    {key: 'next', glyph: '⏭', title: 'Next', icon: true, group: 'transport'},
  ];
  return (
    <View style={placement.vertical ? null : [shared.toolbar, {borderColor: colors.border}]}>
      <Actions actions={actions} vertical={placement.vertical} />
    </View>
  );
}

function Artwork({size}: {size: number}) {
  const colors = useColors();
  return (
    <View style={[styles.artwork, {width: size, height: size, backgroundColor: colors.water}]}>
      <Text style={[styles.artworkGlyph, {fontSize: size / 3}]}>🌊</Text>
    </View>
  );
}

function Cover() {
  const {width, height} = usePane();
  return <Artwork size={Math.min(width, height) * Layout.artworkShare} />;
}

/** Partly folded, the art takes one side of the fold and the track the other, like Music in tabletop. */
function NowPlaying() {
  const fold = useFold();
  if (fold) {
    return (
      <PaneLayout
        arrangement="side-by-side"
        leading={
          <View style={shared.center}>
            <Cover />
          </View>
        }
        trailing={
          <View style={shared.center}>
            <Track />
          </View>
        }
      />
    );
  }
  return (
    <View style={shared.center}>
      <Cover />
      <Track />
    </View>
  );
}

function Track() {
  const colors = useColors();
  return (
    <View style={[shared.center, styles.track]}>
      <Title>Morning Light</Title>
      <Body muted>The Lanterns</Body>
      <View style={[styles.bar, {backgroundColor: colors.raised}]}>
        <View style={[styles.progress, {backgroundColor: colors.accent}]} />
      </View>
    </View>
  );
}

export function MusicCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  const sideInsetTop = useSideInsetTop(insetTop);
  return (
    <DuoPage
      topBarStyle={{paddingTop: insetTop}}
      topBar={placement => (
        <NavBar placement={placement} leading={[closeAction(onClose)]} trailing={[{key: 'queue', glyph: '☰', title: 'Up next', icon: true}]} title="Now Playing" />
      )}
      bottomBar={placement => <Transport placement={placement} />}
      sideInsetTop={sideInsetTop}
      renderSide={({edge, top, bottom, insetTop: roomTop, insetBottom}) => (
        <View
          style={[
            styles.side,
            {paddingTop: roomTop, paddingBottom: Math.max(insetBottom, Spacing.lg), backgroundColor: colors.raised, borderColor: colors.accent},
            edge === 'trailing' ? styles.borderStart : styles.borderEnd,
          ]}>
          {top}
          <View style={shared.fill} />
          <Artwork size={Layout.thumb} />
          {bottom}
        </View>
      )}>
      <NowPlaying />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  side: {width: Layout.barWidth + Spacing.lg, alignItems: 'center', gap: Spacing.md},
  borderStart: {borderStartWidth: 2},
  borderEnd: {borderEndWidth: 2},
  artwork: {borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center'},
  artworkGlyph: {textAlign: 'center'},
  track: {flex: 0, alignSelf: 'stretch'},
  bar: {alignSelf: 'stretch', height: Spacing.xs, borderRadius: Radii.pill},
  progress: {width: '40%', height: Spacing.xs, borderRadius: Radii.pill},
});
