import {fireEvent, render, screen} from '@testing-library/react-native';
import {useState} from 'react';
import {Pressable, Text, View} from 'react-native';

import {DUO_OVERLAY_TESTID} from '../layout';
import {DuoOverlay, DuoOverlayHost} from '../overlay';

function Screen() {
  const [open, setOpen] = useState(true);
  const [count, setCount] = useState(0);
  return (
    <View testID="page">
      <Pressable testID="bump" onPress={() => setCount(value => value + 1)} />
      {open ? (
        <DuoOverlay>
          <Text>sheet {count}</Text>
          <Pressable testID="close" onPress={() => setOpen(false)} />
        </DuoOverlay>
      ) : null}
    </View>
  );
}

function topLevelIds(): string[] {
  const tree = screen.toJSON();
  const nodes = tree === null ? [] : Array.isArray(tree) ? tree : tree.type === '' ? (tree.children ?? []) : [tree];
  return nodes.map(node => (typeof node === 'string' ? node : String(node.props.testID)));
}

describe('DuoOverlay', () => {
  it('draws after everything the host wraps, so a strip drawn after the page stays under it', async () => {
    await render(
      <DuoOverlayHost>
        <Screen />
        <View testID="strip" />
      </DuoOverlayHost>,
    );
    expect(topLevelIds()).toEqual(['page', 'strip', DUO_OVERLAY_TESTID]);
    expect(screen.getByTestId('page')).not.toContainElement(screen.getByText('sheet 0'));
  });

  it('follows its owner: updates in place, and leaves with it', async () => {
    await render(
      <DuoOverlayHost>
        <Screen />
      </DuoOverlayHost>,
    );
    await fireEvent.press(screen.getByTestId('bump'));
    expect(screen.getByText('sheet 1')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('close'));
    expect(screen.queryByText(/sheet/)).toBeNull();
    expect(topLevelIds()).toEqual(['page']);
  });

  it('throws without a host rather than drawing under the page', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Screen />)).rejects.toThrow('DuoOverlay needs a DuoOverlayHost above it.');
  });
});
