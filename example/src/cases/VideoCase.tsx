/**
 * `mode="horizontal"` and the lower-level `Arrangement`. A player keeps its controls where they are in every pose,
 * so its page never moves them to the strip; the video and its comments are a split `Arrangement`, stacked when the
 * window is taller than wide and side by side across the open iPhone Duo's fold.
 */
import {DuoPage, useCameraClearance, usePane, type PageMode} from '@garrettmacmac/react-native-duo';
import {Arrangement} from '@garrettmacmac/react-native-duo/layout';
import {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {Actions, NavBar} from '../bars';
import {Body} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, type CaseProps} from './shared';

function Player() {
  const colors = useColors();
  const {width, height} = usePane();
  return (
    <View style={[shared.center, {backgroundColor: colors.text}]}>
      <View style={[styles.video, {width: Math.min(width - Spacing.lg * 2, ((height - Layout.tapTarget * 2 - Spacing.lg * 2) * 16) / 9), backgroundColor: colors.water}]}>
        <Text style={styles.videoGlyph}>▶</Text>
      </View>
      <Actions
        actions={[
          {key: 'back15', glyph: '↺', title: 'Back 15 seconds', icon: true, group: 'play'},
          {key: 'pause', glyph: '⏸', title: 'Pause', icon: true, group: 'play', selected: true},
          {key: 'ahead15', glyph: '↻', title: 'Ahead 15 seconds', icon: true, group: 'play'},
        ]}
        vertical={false}
      />
    </View>
  );
}

function Comments({mode}: {mode: PageMode}) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={shared.content}>
      <Text style={[styles.heading, {color: colors.text}]}>Comments</Text>
      <Body muted>The page's bars: {mode}, forced, in every pose.</Body>
      {['Love the clouds at 0:42', 'What camera was this shot on?', 'So calm'].map(comment => (
        <View key={comment} style={[styles.comment, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Body>{comment}</Body>
        </View>
      ))}
    </ScrollView>
  );
}

export function VideoCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  const [mode, setMode] = useState<PageMode>('horizontal');
  const clearance = useCameraClearance();
  return (
    <DuoPage
      mode="horizontal"
      onModeChange={setMode}
      topBarStyle={{paddingTop: Math.max(insetTop, clearance.top), backgroundColor: colors.surface}}
      topBar={placement => <NavBar placement={placement} leading={[closeAction(onClose)]} title="Mountain Timelapse" trailing={[{key: 'share', glyph: '⇪', title: 'Share', icon: true, role: 'prominent'}]} />}>
      <Arrangement kind="split" primary={<Player />} secondary={<Comments mode={mode} />} />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  video: {aspectRatio: 16 / 9, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center'},
  videoGlyph: {fontSize: Type.display * 2},
  heading: {fontSize: Type.title, fontWeight: '700'},
  comment: {borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md},
});
