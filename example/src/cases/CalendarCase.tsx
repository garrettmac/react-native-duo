/**
 * `sideTopBar` and `sideBottomBar`: a different component for the strip. On a phone the top bar is a segmented
 * control and the bottom bar three text buttons; neither can stand, so the strip gets one button that cycles the view
 * and three symbols instead.
 */
import {DuoPage, usePage} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {Actions, BarButton, type Action} from '../bars';
import {Title} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

const VIEWS = ['Day', 'Week', 'Month'] as const;
type CalendarView = (typeof VIEWS)[number];

const DAYS = ['Mon 5', 'Tue 6', 'Wed 7', 'Thu 8', 'Fri 9', 'Sat 10', 'Sun 11'];
const EVENTS = ['Team standup, 9 AM', 'Design review, 2 PM', 'Lunch with Sam', 'Dentist, 3 PM', 'Gym, 6 PM', 'Farmers market', 'Family dinner, 7 PM'];

function Segmented({value, onChange}: {value: CalendarView; onChange: (view: CalendarView) => void}) {
  const colors = useColors();
  return (
    <View style={[styles.segmented, {backgroundColor: colors.raised}]}>
      {VIEWS.map(view => (
        <Pressable
          key={view}
          accessibilityRole="button"
          accessibilityState={{selected: view === value}}
          onPress={() => onChange(view)}
          style={[styles.segment, view === value && {backgroundColor: colors.surface}]}>
          <Text style={[styles.segmentLabel, {color: colors.text}]}>{view}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function TextToolbar() {
  const colors = useColors();
  return (
    <View style={[shared.toolbar, {borderColor: colors.border, backgroundColor: colors.surface}]}>
      {['Today', 'Calendars', 'Inbox'].map(label => (
        <Pressable key={label} accessibilityRole="button" style={styles.textButton}>
          <Text style={[styles.textButtonLabel, {color: colors.accent}]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Week({view}: {view: CalendarView}) {
  const colors = useColors();
  const page = usePage();
  return (
    <ScrollView contentContainerStyle={shared.content}>
      {page.vertical ? <Title>October · {view}</Title> : null}
      {DAYS.map((day, index) => (
        <View key={day} style={[styles.day, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.dayLabel, {color: colors.muted}]}>{day}</Text>
          <Text style={[styles.event, {color: colors.text}]}>{EVENTS[index]}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function CalendarCase({onClose, insetTop}: CaseProps) {
  const colors = useColors();
  const [view, setView] = useState<CalendarView>('Week');
  const close = closeAction(onClose);
  const add: Action = {key: 'add', glyph: '+', title: 'New event', icon: true, role: 'prominent'};
  const cycle: Action = {key: 'view', glyph: view[0], title: `${view} view`, icon: true, onPress: () => setView(VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length])};
  return (
    <DuoPage
      topBarStyle={{paddingTop: insetTop}}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}
      topBar={
        <View style={[shared.navBar, {borderColor: colors.border}]}>
          <BarButton action={close} vertical={false} showTitle={false} />
          <View style={shared.fill}>
            <Segmented value={view} onChange={setView} />
          </View>
          <BarButton action={add} vertical={false} showTitle={false} />
        </View>
      }
      sideTopBar={<Actions actions={[close, add, cycle]} vertical />}
      bottomBar={<TextToolbar />}
      sideBottomBar={
        <Actions
          actions={[
            {key: 'today', glyph: '◉', title: 'Today', icon: true, group: 'tools'},
            {key: 'calendars', glyph: '▦', title: 'Calendars', icon: true, group: 'tools'},
            {key: 'inbox', glyph: '✉', title: 'Inbox', icon: true, group: 'tools'},
          ]}
          vertical
        />
      }>
      <Week view={view} />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  segmented: {flexDirection: 'row', borderRadius: Radii.pill, padding: Spacing.xs / 2},
  segment: {flex: 1, minHeight: Layout.tapTarget - Spacing.sm, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center'},
  segmentLabel: {fontSize: Type.body, fontWeight: '600'},
  textButton: {minHeight: Layout.tapTarget, justifyContent: 'center', paddingHorizontal: Spacing.md},
  textButtonLabel: {fontSize: Type.body, fontWeight: '600'},
  day: {borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: Spacing.xs},
  dayLabel: {fontSize: Type.caption, fontWeight: '700'},
  event: {fontSize: Type.body, fontWeight: '600'},
});
