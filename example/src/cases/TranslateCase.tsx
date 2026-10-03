/**
 * `PaneLayout arrangement="side-by-side"`: two contents at once. Stacked on a phone and the closed iPhone Duo (taller
 * than wide), side by side when wider than tall, one on each display across the open iPhone Duo's fold.
 */
import {DuoPage, PaneLayout, usePane} from '@garrettmacmac/react-native-duo';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {NavBar} from '../bars';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

function Side({language, text, editable}: {language: string; text: string; editable: boolean}) {
  const colors = useColors();
  const pane = usePane();
  return (
    <View style={[shared.content, shared.fill]}>
      <Text style={[styles.language, {color: colors.muted}]}>
        {language} · {pane.side} pane, {Math.round(pane.width)}×{Math.round(pane.height)}
      </Text>
      <TextInput
        multiline
        editable={editable}
        defaultValue={text}
        style={[styles.text, {color: colors.text, backgroundColor: editable ? colors.surface : colors.raised, borderColor: colors.border}]}
      />
    </View>
  );
}

export function TranslateCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  return (
    <DuoPage
      topBarStyle={{paddingTop: insetTop}}
      topBar={placement => (
        <NavBar
          placement={placement}
          leading={[closeAction(onClose)]}
          title={placement.vertical ? undefined : 'English → Spanish'}
          trailing={[{key: 'swap', glyph: '⇄', title: 'Swap languages', icon: true}]}
        />
      )}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <PaneLayout
        arrangement="side-by-side"
        leading={<Side language="English" text="Where is the nearest train station?" editable />}
        trailing={<Side language="Spanish" text="¿Dónde está la estación de tren más cercana?" editable={false} />}
      />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  language: {fontSize: Type.caption, fontWeight: '700'},
  text: {flex: 1, minHeight: Layout.tapTarget * 2, borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, fontSize: Type.title, textAlignVertical: 'top'},
});
