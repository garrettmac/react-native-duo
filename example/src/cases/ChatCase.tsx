/**
 * `shareSide={false}`. The app's tabs stand in the strip and the chat list gives its bar to it, but the conversation
 * keeps its header and its composer in its own pane: a text field cannot stand, and the person types under the
 * messages in every pose.
 */
import {DuoPage, PaneLayout, usePage, usePane, type BarPlacement} from '@garrettmacmac/react-native-duo';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {Actions, BarButton, NavBar, type Action} from '../bars';
import {Body, Title} from '../components';
import {Layout, Radii, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

const CHATS = [
  {id: 'ana', name: 'Ana', last: 'Running five minutes late'},
  {id: 'ben', name: 'Ben', last: 'Lunch moved to 1'},
  {id: 'chen', name: 'Chen', last: 'Photos from the hike'},
  {id: 'dev', name: 'Dev', last: 'Concert tickets attached'},
];

function Tabs({placement}: {placement: BarPlacement}) {
  const colors = useColors();
  const tabs: Action[] = [
    {key: 'chats', glyph: '💬', title: 'Chats', icon: true, selected: true, group: 'tabs'},
    {key: 'calls', glyph: '☏', title: 'Calls', icon: true, group: 'tabs'},
    {key: 'settings', glyph: '⚙', title: 'Settings', icon: true, group: 'tabs'},
  ];
  return (
    <View style={placement.vertical ? null : [shared.toolbar, {borderColor: colors.border, backgroundColor: colors.surface}]}>
      <Actions actions={tabs} vertical={placement.vertical} titles={!placement.vertical} />
    </View>
  );
}

function ChatRows({onOpen, open}: {onOpen: (id: string) => void; open: string | null}) {
  const colors = useColors();
  const page = usePage();
  return (
    <ScrollView>
      {page.vertical ? (
        <View style={shared.content}>
          <Title>Chats</Title>
        </View>
      ) : null}
      {CHATS.map(chat => (
        <Pressable
          key={chat.id}
          accessibilityRole="button"
          onPress={() => onOpen(chat.id)}
          style={[styles.row, {borderColor: colors.border}, chat.id === open && {backgroundColor: colors.raised}]}>
          <Text style={[styles.name, {color: colors.text}]}>{chat.name}</Text>
          <Text style={[styles.last, {color: colors.muted}]}>{chat.last}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ChatList({onClose, onOpen, open}: {onClose: () => void; onOpen: (id: string) => void; open: string | null}) {
  return (
    <DuoPage
      topBar={placement => (
        <NavBar
          placement={placement}
          leading={[closeAction(onClose)]}
          title="Chats"
          trailing={[{key: 'new', glyph: '✎', title: 'New chat', icon: true, role: 'prominent'}]}
        />
      )}>
      <ChatRows onOpen={onOpen} open={open} />
    </DuoPage>
  );
}

function Composer() {
  const colors = useColors();
  return (
    <View style={[styles.composer, {borderColor: colors.border, backgroundColor: colors.surface}]}>
      <TextInput placeholder="Message" placeholderTextColor={colors.muted} style={[styles.input, {backgroundColor: colors.raised, color: colors.text}]} />
      <BarButton action={{key: 'send', glyph: '↑', title: 'Send', icon: true, selected: true}} vertical={false} showTitle={false} />
    </View>
  );
}

function Conversation({id, showBack, onBack}: {id: string; showBack: boolean; onBack: () => void}) {
  const colors = useColors();
  const chat = CHATS.find(entry => entry.id === id)!;
  return (
    <DuoPage
      shareSide={false}
      topBar={
        <View style={[shared.navBar, {borderColor: colors.border}]}>
          {showBack ? <BarButton action={{key: 'back', glyph: '‹', title: 'Back', icon: true, onPress: onBack}} vertical={false} showTitle={false} /> : null}
          <Text style={[styles.header, {color: colors.text}]}>{chat.name}</Text>
          <BarButton action={{key: 'call', glyph: '☏', title: 'Call', icon: true}} vertical={false} showTitle={false} />
        </View>
      }
      bottomBar={<Composer />}>
      <ScrollView contentContainerStyle={shared.content}>
        <View style={[styles.bubble, {backgroundColor: colors.raised}]}>
          <Body>{chat.last}</Body>
        </View>
        <View style={[styles.bubble, styles.mine, {backgroundColor: colors.accent}]}>
          <Text style={[styles.mineText, {color: colors.onAccent}]}>On my way</Text>
        </View>
      </ScrollView>
    </DuoPage>
  );
}

function ConversationPane({id, onBack}: {id: string; onBack: () => void}) {
  const {split} = usePane();
  return <Conversation id={id} showBack={!split} onBack={onBack} />;
}

function Chats({onClose, initial}: {onClose: () => void; initial: string | null}) {
  const [open, setOpen] = useState<string | null>(initial);
  return (
    <PaneLayout
      arrangement="list-detail"
      compact={open ? 'trailing' : 'leading'}
      leading={<ChatList onClose={onClose} onOpen={setOpen} open={open} />}
      trailing={
        open ? (
          <ConversationPane id={open} onBack={() => setOpen(null)} />
        ) : (
          <View style={shared.center}>
            <Body muted>Pick a chat.</Body>
          </View>
        )
      }
    />
  );
}

export function ChatCase({onClose, insetTop, params}: CaseProps) {
  const colors = useColors();
  return (
    <DuoPage
      topBar={<View style={{height: insetTop}} />}
      sideTopBar={() => null}
      bottomBar={placement => <Tabs placement={placement} />}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <Chats onClose={onClose} initial={params.get('chat')} />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  row: {minHeight: Layout.tapTarget, paddingHorizontal: Layout.gutter, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth},
  name: {fontSize: Type.title, fontWeight: '600'},
  last: {fontSize: Type.body},
  header: {flex: 1, fontSize: Type.title, fontWeight: '700'},
  composer: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth},
  input: {flex: 1, minHeight: Layout.tapTarget, borderRadius: Radii.pill, paddingHorizontal: Spacing.lg, fontSize: Type.body},
  bubble: {alignSelf: 'flex-start', maxWidth: '80%', borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  mine: {alignSelf: 'flex-end'},
  mineText: {fontSize: Type.body},
});
