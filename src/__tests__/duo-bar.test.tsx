import {render, screen} from '@testing-library/react-native';
import {Text, View} from 'react-native';

import type {BarItem} from '../bar';
import {DuoBar} from '../duo-bar';
import {DuoTestProvider} from '../DuoTestProvider';
import type {PoseName} from '../poses';

const items: BarItem[] = [
  {key: 'back', role: 'navigation', icon: true, title: 'Back'},
  {key: 'share', role: 'prominent', icon: true, title: 'Share'},
  {key: 'reply', icon: true, title: 'Reply', group: 'respond'},
  {key: 'forward', icon: true, title: 'Forward', group: 'respond'},
  {key: 'trash', icon: true, title: 'Delete', bar: 'bottom'},
];

async function renderBar(pose: PoseName, extra: object = {}) {
  await render(
    <DuoTestProvider pose={pose}>
      <DuoBar
        items={items}
        renderItem={(item, {vertical}) => <Text testID={`item-${item.key}`}>{`${item.key}:${vertical}`}</Text>}
        renderGroup={(children, group) => <View testID={`group-${group.map(entry => entry.key).join('+')}`}>{children}</View>}
        title={<Text testID="title">Message</Text>}
        {...extra}
      />
    </DuoTestProvider>,
  );
}

const order = () => screen.getAllByTestId(/^item-/).map(node => String(node.props.children));

describe('DuoBar', () => {
  it('draws a horizontal bar on a phone: Back at the start, the prominent action last, the title between', async () => {
    await renderBar('phone');
    expect(order()).toEqual(['back:false', 'reply:false', 'forward:false', 'trash:false', 'share:false']);
    expect(screen.getByTestId('title')).toBeTruthy();
    expect(screen.getByTestId('group-reply+forward')).toBeTruthy();
  });

  it('stands on the closed iPhone Duo in Apple’s order, without the title', async () => {
    await renderBar('closed');
    expect(order()).toEqual(['back:true', 'share:true', 'reply:true', 'forward:true', 'trash:true']);
    expect(screen.queryByTestId('title')).toBeNull();
  });

  it('can be forced either way and styled per part', async () => {
    await renderBar('closed', {axis: 'horizontal', itemStyle: {padding: 1}});
    expect(order()[0]).toBe('back:false');
  });

  it('splits one item list across a top bar and a bottom bar', async () => {
    const pair = (pose: PoseName) =>
      render(
        <DuoTestProvider pose={pose}>
          {(['top', 'bottom'] as const).map(part => (
            <DuoBar key={part} part={part} items={items} renderItem={(item, {vertical}) => <Text testID={`item-${item.key}`}>{`${part}:${item.key}:${vertical}`}</Text>} />
          ))}
        </DuoTestProvider>,
      );
    await pair('phone');
    expect(order()).toEqual(['top:back:false', 'top:reply:false', 'top:forward:false', 'top:share:false', 'bottom:trash:false']);
    await pair('closed');
    expect(order()).toEqual(['top:back:true', 'top:share:true', 'top:reply:true', 'top:forward:true', 'bottom:trash:true']);
  });

  it('draws the overflow with the top part only', async () => {
    const renderOverflow = jest.fn(() => <Text testID="more">More</Text>);
    await render(
      <DuoTestProvider pose="closedLandscape">
        {(['top', 'bottom'] as const).map(part => (
          <DuoBar key={part} part={part} items={items} itemLength={120} renderItem={item => <Text>{item.key}</Text>} renderOverflow={renderOverflow} />
        ))}
      </DuoTestProvider>,
    );
    expect(screen.getAllByTestId('more')).toHaveLength(1);
  });
});
