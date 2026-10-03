/**
 * The example app: every demo inside the Shell, either live on this device or in a simulated pose. Pick a pose at the
 * bottom to see the same screens on a closed or open iPhone Duo, partly folded, in a split view or on an iPad.
 */
import {DuoOverlayHost, DuoProvider} from '@garrettmacmac/react-native-duo';
import {POSE_NAMES} from '@garrettmacmac/react-native-duo/testing';
import {StatusBar} from 'expo-status-bar';
import {useState} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';

import {Button} from './components';
import {RegionOverlay} from './RegionOverlay';
import {PoseScreen} from './screens/PoseScreen';
import {MapScreen} from './screens/MapScreen';
import {InboxScreen} from './screens/InboxScreen';
import {KeypadScreen} from './screens/KeypadScreen';
import {BarsScreen} from './screens/BarsScreen';
import {GridScreen} from './screens/GridScreen';
import {FoldScreen} from './screens/FoldScreen';
import {SheetScreen} from './screens/SheetScreen';
import {CasesScreen} from './screens/CasesScreen';
import {CASES} from './cases';
import {Shell, type Demo} from './Shell';
import {Simulator, type SimulatedPose} from './Simulator';
import {Spacing, useColors} from './theme';

const QUERY = new URLSearchParams(Platform.OS === 'web' && typeof location !== 'undefined' ? location.search : '');

const DEMOS: Demo[] = [
  {key: 'mail', glyph: '✉', title: 'Mail'},
  {key: 'map', glyph: '⌖', title: 'Map'},
  {key: 'keypad', glyph: '▤', title: 'Keypad'},
  {key: 'bars', glyph: '☰', title: 'Bars'},
  {key: 'grid', glyph: '▦', title: 'Grid'},
  {key: 'fold', glyph: '◫', title: 'Fold'},
  {key: 'sheet', glyph: '▭', title: 'Sheet'},
  {key: 'pose', glyph: '◎', title: 'Pose'},
  {key: 'cases', glyph: '✦', title: 'Cases'},
];

const SCREENS: Record<string, () => React.JSX.Element> = {
  mail: () => <InboxScreen initial={QUERY.get('message')} />,
  map: MapScreen,
  keypad: KeypadScreen,
  bars: BarsScreen,
  grid: GridScreen,
  fold: FoldScreen,
  sheet: SheetScreen,
  pose: PoseScreen,
};

function Demos({insetTop}: {insetTop: number}) {
  const [current, setCurrent] = useState(QUERY.get('demo') ?? 'mail');
  const [openCase, setOpenCase] = useState<string | null>(QUERY.get('case'));
  const advanced = CASES.find(entry => entry.key === openCase);
  if (advanced) {
    return (
      <View style={styles.fill}>
        <advanced.Component onClose={() => setOpenCase(null)} insetTop={insetTop} params={QUERY} />
        <RegionOverlay />
      </View>
    );
  }
  const Screen = SCREENS[current];
  return (
    <View style={styles.fill}>
      <DuoOverlayHost>
        <Shell demos={DEMOS} current={current} onPick={setCurrent} insetTop={insetTop}>
          {current === 'cases' ? <CasesScreen onOpen={setOpenCase} /> : <Screen />}
        </Shell>
      </DuoOverlayHost>
      <RegionOverlay />
    </View>
  );
}

function Root() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pose, setPose] = useState<SimulatedPose>((QUERY.get('pose') as SimulatedPose | null) ?? 'live');
  return (
    <View style={[styles.fill, {backgroundColor: colors.background}]}>
      <StatusBar style="auto" />
      <Simulator pose={pose}>
        <Demos insetTop={pose === 'live' ? insets.top : 0} />
      </Simulator>
      <ScrollView horizontal style={[styles.poses, {borderColor: colors.border}]} contentContainerStyle={[styles.posesContent, {paddingBottom: insets.bottom + Spacing.sm}]}>
        {(['live', ...POSE_NAMES] as SimulatedPose[]).map(name => (
          <Button key={name} label={name === 'live' ? 'Live' : name} selected={name === pose} onPress={() => setPose(name)} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DuoProvider>
        <Root />
      </DuoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  poses: {flexGrow: 0, borderTopWidth: StyleSheet.hairlineWidth},
  posesContent: {gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm},
});
