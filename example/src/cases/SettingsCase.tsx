/**
 * `DetailStack` drawn your own way. `renderStack` slides each new screen in and adds a path along the bottom;
 * `popToRoot` closes the whole stack from any depth; `showBackOnRoot` keeps Back off the first screen even on a phone,
 * since the list here has its own Close.
 */
import {DetailStack, DuoPage, PaneLayout, useDetailStack, usePane, usePage, type DetailStackScreen} from '@garrettmacmac/react-native-duo';
import {useEffect, useRef, useState} from 'react';
import {Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {NavBar, type Action} from '../bars';
import {Title} from '../components';
import {Layout, Spacing, Type, useColors} from '../theme';
import {closeAction, shared, useSideInsetTop, type CaseProps} from './shared';

interface Section {
  key: string;
  title: string;
  rows: string[];
}

const SECTIONS: Section[] = [
  {key: 'general', title: 'General', rows: ['About', 'Language', 'Storage']},
  {key: 'display', title: 'Display', rows: ['Brightness', 'Text size']},
  {key: 'privacy', title: 'Privacy', rows: ['Location', 'Camera']},
];

const DEEPER: Record<string, string[]> = {About: ['Legal', 'Certificates'], Legal: ['License', 'Warranty']};

function SlideIn({children}: {children: React.ReactNode}) {
  const {width} = usePane();
  const offset = useRef(new Animated.Value(Math.min(width, Layout.slide))).current;
  useEffect(() => {
    Animated.timing(offset, {toValue: 0, duration: Layout.slide, useNativeDriver: Platform.OS !== 'web'}).start();
  }, [offset]);
  return <Animated.View style={[shared.fill, {transform: [{translateX: offset}]}]}>{children}</Animated.View>;
}

function Trail({titles}: {titles: string[]}) {
  const colors = useColors();
  return (
    <View style={[styles.trail, {borderColor: colors.border, backgroundColor: colors.surface}]}>
      <Text numberOfLines={1} style={[styles.trailText, {color: colors.muted}]}>
        {titles.join('  ›  ')}
      </Text>
    </View>
  );
}

function SettingsPage({title, rows, path}: {title: string; rows: string[]; path: string[]}) {
  const stack = useDetailStack();
  const colors = useColors();
  const back: Action[] = stack.showBack ? [{key: 'back', glyph: '‹', title: 'Back', icon: true, role: 'navigation', onPress: stack.back}] : [];
  const done: Action[] = stack.depth > 1 ? [{key: 'done', glyph: '⤒', title: 'Back to the top', icon: true, onPress: stack.popToRoot}] : [];
  return (
    <DuoPage topBar={placement => <NavBar placement={placement} leading={back} title={placement.vertical ? undefined : title} trailing={done} />}>
      <PageBody title={title}>
        {rows.map(row => (
          <Pressable
            key={row}
            accessibilityRole="button"
            onPress={() => stack.push(<SettingsPage title={row} rows={DEEPER[row] ?? []} path={[...path, row]} />, [...path, row].join('/'))}
            style={[styles.row, {borderColor: colors.border, backgroundColor: colors.surface}]}>
            <Text style={[styles.rowLabel, {color: colors.text}]}>{row}</Text>
            <Text style={[styles.rowLabel, {color: colors.muted}]}>›</Text>
          </Pressable>
        ))}
      </PageBody>
    </DuoPage>
  );
}

function PageBody({title, children}: {title: string; children: React.ReactNode}) {
  const page = usePage();
  return (
    <ScrollView contentContainerStyle={shared.content}>
      {page.vertical ? <Title>{title}</Title> : null}
      {children}
    </ScrollView>
  );
}

function OpenDeep({path}: {path: string[]}) {
  const stack = useDetailStack();
  useEffect(() => {
    path.forEach((row, index) => stack.push(<SettingsPage title={row} rows={DEEPER[row] ?? []} path={path.slice(0, index + 1)} />, path.slice(0, index + 1).join('/')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function renderStack(titles: string[]) {
  return (screens: DetailStackScreen[], top: number) => (
    <View style={shared.fill}>
      <View style={shared.fill}>
        {screens.map((screen, index) => (
          <View key={screen.key} style={[shared.fill, index !== top && styles.hidden]}>
            {index === 0 ? screen.element : <SlideIn>{screen.element}</SlideIn>}
          </View>
        ))}
      </View>
      {top > 0 ? <Trail titles={[titles[0], ...screens.slice(1, top + 1).map(screen => screen.key.split('/').pop()!)]} /> : null}
    </View>
  );
}

function SectionList({open, onOpen, onClose}: {open: string | null; onOpen: (key: string) => void; onClose: () => void}) {
  const colors = useColors();
  return (
    <DuoPage topBar={placement => <NavBar placement={placement} leading={[closeAction(onClose)]} title={placement.vertical ? undefined : 'Settings'} />}>
      <PageBody title="Settings">
        {SECTIONS.map(section => (
          <Pressable
            key={section.key}
            accessibilityRole="button"
            onPress={() => onOpen(section.key)}
            style={[styles.row, {borderColor: colors.border, backgroundColor: section.key === open ? colors.raised : colors.surface}]}>
            <Text style={[styles.rowLabel, {color: colors.text}]}>{section.title}</Text>
          </Pressable>
        ))}
      </PageBody>
    </DuoPage>
  );
}

export function SettingsCase({onClose, insetTop, params}: CaseProps) {
  const colors = useColors();
  const deep = params.get('path')?.split('/').filter(Boolean) ?? [];
  const [open, setOpen] = useState<string | null>(params.get('section') ?? (deep.length > 0 ? 'general' : null));
  const section = SECTIONS.find(entry => entry.key === open);
  return (
    <DuoPage
      topBar={<View style={{height: insetTop}} />}
      sideTopBar={() => null}
      sideInsetTop={useSideInsetTop(insetTop)}
      sideStyle={[shared.strip, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <PaneLayout
        arrangement="list-detail"
        compact={section ? 'trailing' : 'leading'}
        leading={<SectionList open={open} onOpen={setOpen} onClose={onClose} />}
        trailing={
          section ? (
            <DetailStack key={section.key} onExit={() => setOpen(null)} renderStack={renderStack([section.title])}>
              <SettingsPage title={section.title} rows={section.rows} path={[]} />
              <OpenDeep path={deep} />
            </DetailStack>
          ) : (
            <View style={shared.center} />
          )
        }
      />
    </DuoPage>
  );
}

const styles = StyleSheet.create({
  hidden: {display: 'none'},
  row: {minHeight: Layout.tapTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, borderRadius: Spacing.md, borderWidth: StyleSheet.hairlineWidth},
  rowLabel: {fontSize: Type.body, fontWeight: '600'},
  trail: {paddingHorizontal: Layout.gutter, paddingVertical: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth},
  trailText: {fontSize: Type.caption, fontWeight: '600'},
});
