/** Controls step out of the fold; the text behind them does not need to. Partly fold the device to see it. */
import {AvoidReservedRegions, useFold} from '@garrettmacmac/react-native-duo';
import {StyleSheet, View} from 'react-native';

import {Body, Button, Card, Page, Title} from '../components';
import {Spacing} from '../theme';

export function FoldScreen() {
  const fold = useFold();
  return (
    <Page>
      <Card>
        <Title>{fold ? 'The fold is active' : 'No active fold'}</Title>
        <Body muted>
          Each button below is wrapped in AvoidReservedRegions. The middle one sits on the fold when the device is partly folded, and moves aside by
          the smallest step that clears it.
        </Body>
      </Card>
      <View style={styles.row}>
        {['Left', 'Middle', 'Right'].map(label => (
          <AvoidReservedRegions key={label}>
            <Button label={label} onPress={() => {}} />
          </AvoidReservedRegions>
        ))}
      </View>
      <Body>
        Scrolling text like this paragraph may pass under the fold. Apple's own sheets, alerts, menus and toolbar buttons move out of the fold by themselves;
        custom React Native controls need to do it through the reserved regions.
      </Body>
    </Page>
  );
}

const styles = StyleSheet.create({row: {flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm}});
