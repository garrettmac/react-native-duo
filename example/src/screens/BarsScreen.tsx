/**
 * What happens when a side strip runs out of room, Apple's two ways: a navigation screen keeps its tab bar and folds
 * the toolbar into one More button; a task screen keeps its toolbar and shrinks the tab bar to one button. Both come
 * from the same layout `useVerticalBar` runs for a strip's height.
 */
import {barGroups, type VerticalBarCompression} from '@garrettmacmac/react-native-duo';
import {verticalBarLayout} from '@garrettmacmac/react-native-duo/layout';
import {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {BarButton, Capsule, type Action} from '../bars';
import {Body, Button, Card, Title} from '../components';
import {Layout, Spacing, Type, useColors} from '../theme';

const ITEMS: Action[] = [
  {key: 'back', glyph: '‹', title: 'Back', icon: true, role: 'navigation'},
  {key: 'share', glyph: '⇪', title: 'Share', icon: true, role: 'prominent'},
  {key: 'checklist', glyph: '☑', title: 'Checklist', icon: true, group: 'insert'},
  {key: 'attach', glyph: '📎', title: 'Attach', icon: true, group: 'insert'},
  {key: 'markup', glyph: '✎', title: 'Markup', icon: true, group: 'insert', priority: 'low'},
];
const TABS = 4;
const STRIP_ITEMS = 6;

function Strip({compression}: {compression: VerticalBarCompression}) {
  const colors = useColors();
  const layout = verticalBarLayout({edge: 'trailing', items: ITEMS, length: STRIP_ITEMS * Layout.barItem, itemLength: Layout.barItem, tabBarLength: TABS * Layout.barItem, compression});
  const items = layout.top;
  const overflow = layout.overflow;
  return (
    <View style={[styles.strip, {height: STRIP_ITEMS * Layout.barItem + Spacing.xl, borderColor: colors.border}]}>
      {barGroups(items).map(group => (
        <Capsule key={group[0].key} vertical>
          {group.map(item => (
            <BarButton key={item.key} action={item} vertical />
          ))}
        </Capsule>
      ))}
      {overflow.length > 0 ? <BarButton action={{key: 'more', glyph: '⋯', title: 'More', icon: true}} vertical /> : null}
      <View style={styles.fill} />
      <Capsule vertical>
        {(layout.tabBar === 'minimized' ? ['▣'] : ['⌂', '▦', '♫', '⌕']).map(glyph => (
          <BarButton key={glyph} action={{key: glyph, glyph, title: glyph, icon: true}} vertical />
        ))}
      </Capsule>
    </View>
  );
}

export function BarsScreen() {
  const [compression, setCompression] = useState<VerticalBarCompression>('prefersTabBar');
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card>
        <Title>When the strip runs out of room</Title>
        <Body muted>`useVerticalBar(items, {'{'}compression{'}'})` decides what folds away, by priority and group.</Body>
        <View style={styles.row}>
          <Button label="Keep the tab bar" selected={compression === 'prefersTabBar'} onPress={() => setCompression('prefersTabBar')} />
          <Button label="Keep the toolbar" selected={compression === 'prefersBarItems'} onPress={() => setCompression('prefersBarItems')} />
        </View>
      </Card>
      <View style={styles.center}>
        <Strip compression={compression} />
        <Text style={styles.caption}>{compression === 'prefersTabBar' ? 'Toolbar items fold into More' : 'The tab bar shrinks to one button'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  page: {padding: Layout.gutter, gap: Layout.section},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  center: {alignItems: 'center', gap: Spacing.sm},
  strip: {width: Layout.barWidth, alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: Layout.barWidth / 2},
  caption: {fontSize: Type.caption},
});
