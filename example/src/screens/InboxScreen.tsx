/**
 * Mail, the way Apple draws it on iPhone Duo. The list and the message share the window through `PaneLayout`; the
 * message and anything opened from it stack in the trailing pane through `DetailStack`. Each side is a `DuoPage`:
 * on a phone the list's bar sits on top and the message's toolbar at the bottom; on the closed iPhone Duo both
 * stand in the side strip; open, the list keeps its bar on top of its pane and the message's stand on the edge.
 */
import {DetailStack, DuoBar, DuoPage, PaneLayout, useCameraClearance, useDetailStack, usePage, usePane} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {Actions, BarButton, Capsule, MoreMenu, NavBar, type Action} from '../bars';
import {Body, Title} from '../components';
import {tabBarLength} from '../Shell';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';

const MESSAGES = Array.from({length: 12}, (_, index) => ({
  id: String(index),
  from: ['Ana', 'Ben', 'Chen', 'Dev'][index % 4],
  subject: ['Weekend plans', 'Lunch at noon', 'Photos from the hike', 'Concert tickets'][index % 4],
}));

function SearchField() {
  const colors = useColors();
  return (
    <View style={[styles.searchBar]}>
      <TextInput placeholder="Search" placeholderTextColor={colors.muted} style={[styles.search, {backgroundColor: colors.raised, color: colors.text}]} />
    </View>
  );
}

function Inbox({selected, onOpen}: {selected: string | null; onOpen: (id: string) => void}) {
  const colors = useColors();
  const listActions: Action[] = [
    {key: 'filter', glyph: '≡', title: 'Filter', icon: true, group: 'list'},
    {key: 'more', glyph: '⋯', title: 'More', icon: true, group: 'list'},
  ];
  return (
    <DuoPage
      topBar={placement => <NavBar placement={placement} leading={[{key: 'sidebar', glyph: '▥', title: 'Mailboxes', icon: true}]} trailing={listActions} />}
      bottomBar={<SearchField />}
      sideBottomBar={placement => <Actions actions={[{key: 'search', glyph: '⌕', title: 'Search', icon: true}]} vertical={placement.vertical} />}>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.largeTitle, {color: colors.text}]}>Inbox</Text>
        {MESSAGES.map(message => (
          <Pressable
            key={message.id}
            accessibilityRole="button"
            onPress={() => onOpen(message.id)}
            style={[styles.message, {borderColor: colors.border}, message.id === selected && {backgroundColor: colors.raised}]}>
            <Text style={[styles.from, {color: colors.text}]}>{message.from}</Text>
            <Text style={[styles.subject, {color: colors.muted}]}>{message.subject}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </DuoPage>
  );
}

/**
 * The message's navigation bar and toolbar from one list of items: `part` splits them the same way in both bars, so
 * on the closed iPhone Duo in landscape what does not fit beside the tab bar goes to one More menu.
 */
function MailBar({part, items}: {part: 'top' | 'bottom'; items: Action[]}) {
  const colors = useColors();
  const clearance = useCameraClearance();
  const {height} = usePane();
  const page = usePage();
  return (
    <DuoBar
      part={part}
      items={items}
      renderItem={(item, {vertical}) => <BarButton action={item} vertical={vertical} showTitle={!vertical && part === 'top'} />}
      renderGroup={(children, _group, {vertical}) => <Capsule vertical={vertical}>{children}</Capsule>}
      renderOverflow={(more, {vertical}) => (
        <Capsule vertical={vertical}>
          <MoreMenu items={more} vertical={vertical} edge={page.edge} />
        </Capsule>
      )}
      itemLength={Layout.barItem + Spacing.sm}
      insetTop={clearance.top}
      insetBottom={clearance.bottom}
      tabBarLength={tabBarLength(height, clearance.top)}
      horizontalStyle={part === 'top' ? [styles.navBar, {borderColor: colors.border}] : [styles.toolbar, {borderColor: colors.border}]}
      verticalStyle={styles.standing}
    />
  );
}

function Message({id}: {id: string}) {
  const stack = useDetailStack();
  const message = MESSAGES.find(m => m.id === id)!;
  const colors = useColors();
  const items: Action[] = [
    ...(stack.showBack ? [{key: 'back', glyph: '‹', title: 'Back', icon: true, role: 'navigation', onPress: stack.back} satisfies Action] : []),
    {key: 'trash', glyph: '🗑', title: 'Delete', icon: true, group: 'file', bar: 'bottom'},
    {key: 'folder', glyph: '▭', title: 'Move', icon: true, group: 'file', bar: 'bottom', priority: 'low'},
    {key: 'reply', glyph: '↩', title: 'Reply', icon: true, group: 'respond', bar: 'bottom'},
    {key: 'forward', glyph: '↪', title: 'Forward', icon: true, group: 'respond', bar: 'bottom', priority: 'low'},
    {key: 'compose', glyph: '✎', title: 'New message', icon: true, bar: 'bottom', priority: 'high'},
  ];
  return (
    <DuoPage topBar={<MailBar part="top" items={items} />} bottomBar={<MailBar part="bottom" items={items} />}>
      <ScrollView contentContainerStyle={styles.detail}>
        <Body muted>From {message.from}</Body>
        <Title>{message.subject}</Title>
        <Body>Open and close the device: this message stays open, and the list keeps its scroll.</Body>
        <Pressable accessibilityRole="button" onPress={() => stack.push(<Attachment subject={message.subject} />)} style={[styles.attachment, {backgroundColor: colors.raised}]}>
          <Text style={[styles.from, {color: colors.text}]}>📎 report.pdf</Text>
          <Body muted>Opens deeper in this pane</Body>
        </Pressable>
      </ScrollView>
    </DuoPage>
  );
}

function Attachment({subject}: {subject: string}) {
  const stack = useDetailStack();
  const page = usePage();
  return (
    <DuoPage
      topBar={placement => (
        <NavBar
          placement={placement}
          title={placement.vertical ? undefined : 'report.pdf'}
          leading={[{key: 'back', glyph: '‹', title: 'Back', icon: true, role: 'navigation', onPress: stack.back}]}
          trailing={[{key: 'share', glyph: '⇪', title: 'Share', icon: true, role: 'prominent'}]}
        />
      )}>
      <View style={styles.detail}>
        {page.vertical ? <Title>report.pdf</Title> : null}
        <Body muted>Attached to “{subject}”. Back returns to the message, then the list.</Body>
      </View>
    </DuoPage>
  );
}

function NoMessage() {
  return (
    <View style={[styles.detail, styles.center]}>
      <Body muted>Pick a message.</Body>
    </View>
  );
}

export function InboxScreen({initial = null}: {initial?: string | null}) {
  const [selected, setSelected] = useState<string | null>(initial);
  return (
    <PaneLayout
      arrangement="list-detail"
      compact={selected ? 'trailing' : 'leading'}
      leading={<Inbox selected={selected} onOpen={setSelected} />}
      trailing={
        selected ? (
          <DetailStack key={selected} onExit={() => setSelected(null)}>
            <Message id={selected} />
          </DetailStack>
        ) : (
          <NoMessage />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {paddingBottom: Spacing.sm},
  largeTitle: {fontSize: Type.display, fontWeight: '700', paddingHorizontal: Layout.gutter, paddingVertical: Spacing.sm},
  message: {minHeight: Layout.tapTarget, paddingHorizontal: Layout.gutter, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth},
  from: {fontSize: Type.title, fontWeight: '600'},
  subject: {fontSize: Type.body},
  detail: {padding: Layout.gutter, gap: Spacing.sm},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  attachment: {borderRadius: Radii.md, padding: Spacing.md, gap: Spacing.xs, marginTop: Spacing.md},
  searchBar: {paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  search: {minHeight: Layout.tapTarget, borderRadius: Radii.pill, paddingHorizontal: Spacing.lg, fontSize: Type.body},
  toolbar: {gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth},
  navBar: {minHeight: Layout.tapTarget + Spacing.md, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth},
  standing: {gap: Spacing.sm},
});
