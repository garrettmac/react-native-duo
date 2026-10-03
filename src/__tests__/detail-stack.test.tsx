import {act, fireEvent, render, screen} from '@testing-library/react-native';
import {Fragment} from 'react';
import {Pressable, Text} from 'react-native';

import {DetailStack, detailShowsBack, useDetailStack} from '../detail-stack';
import {DuoTestProvider} from '../DuoTestProvider';
import {PaneLayout} from '../pane';
import type {PoseName} from '../poses';

function Screen({name}: {name: string}) {
  const stack = useDetailStack();
  return (
    <>
      <Text testID={`screen-${name}`}>{`${name} ${stack.depth} ${stack.showBack}`}</Text>
      <Pressable testID={`push-${name}`} onPress={() => stack.push(<Screen name={`${name}+`} />)} />
      <Pressable testID={`back-${name}`} onPress={stack.back} />
    </>
  );
}

async function renderInbox(pose: PoseName, onExit = jest.fn()) {
  await render(
    <DuoTestProvider pose={pose}>
      <PaneLayout
        arrangement="list-detail"
        compact="trailing"
        leading={<Text>Inbox</Text>}
        trailing={
          <DetailStack onExit={onExit}>
            <Screen name="message" />
          </DetailStack>
        }
      />
    </DuoTestProvider>,
  );
  return onExit;
}

const label = (name: string) => String(screen.getByTestId(`screen-${name}`, {includeHiddenElements: true}).props.children);

describe('detailShowsBack', () => {
  it('hides Back only on the first screen with the list beside it', () => {
    expect(detailShowsBack(1, true)).toBe(false);
    expect(detailShowsBack(1, false)).toBe(true);
    expect(detailShowsBack(2, true)).toBe(true);
  });
});

describe('DetailStack', () => {
  it('shows no Back on the first screen beside the list, and Back deeper', async () => {
    await renderInbox('openLandscape');
    expect(label('message')).toBe('message 1 false');
    await act(() => fireEvent.press(screen.getByTestId('push-message')));
    expect(label('message+')).toBe('message+ 2 true');
  });

  it('shows Back on the first screen on a phone and the closed iPhone Duo, and leaves the detail with it', async () => {
    for (const pose of ['phone', 'closed', 'splitHalfTrailing'] as PoseName[]) {
      const onExit = await renderInbox(pose);
      expect(label('message')).toBe('message 1 true');
      await act(() => fireEvent.press(screen.getByTestId('back-message')));
      expect(onExit).toHaveBeenCalledTimes(1);
    }
  });

  it('pops deeper screens before leaving, keeping the ones under mounted', async () => {
    const onExit = await renderInbox('closed');
    await act(() => fireEvent.press(screen.getByTestId('push-message')));
    expect(screen.getByTestId('screen-message', {includeHiddenElements: true})).toBeTruthy();
    await act(() => fireEvent.press(screen.getByTestId('back-message+')));
    expect(screen.queryByTestId('screen-message+', {includeHiddenElements: true})).toBeNull();
    expect(onExit).not.toHaveBeenCalled();
  });
});

describe('DetailStack with DuoPage', () => {
  it('gives the strip only the top screen’s bars', async () => {
    const {DuoPage, DUO_PAGE_STRIP_TESTID} = require('../page');
    function Bars({name}: {name: string}) {
      const stack = useDetailStack();
      return (
        <DuoPage topBar={<Text testID={`bar-${name}`}>{name}</Text>}>
          <Pressable testID={`open-${name}`} onPress={() => stack.push(<Bars name={`${name}+`} />)} />
        </DuoPage>
      );
    }
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage>
          <DetailStack>
            <Bars name="message" />
          </DetailStack>
        </DuoPage>
      </DuoTestProvider>,
    );
    await act(() => fireEvent.press(screen.getByTestId('open-message')));
    const strip = screen.getByTestId(DUO_PAGE_STRIP_TESTID);
    expect(strip).toContainElement(screen.getByTestId('bar-message+'));
    expect(screen.queryByTestId('bar-message')).toBeNull();
  });

  it('tells covered screens their pane is hidden when you draw the stack yourself', async () => {
    const {DuoPage, DUO_PAGE_STRIP_TESTID} = require('../page');
    function Bars({name}: {name: string}) {
      const stack = useDetailStack();
      return (
        <DuoPage topBar={<Text testID={`bar-${name}`}>{name}</Text>}>
          <Pressable testID={`open-${name}`} onPress={() => stack.push(<Bars name={`${name}+`} />)} />
        </DuoPage>
      );
    }
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage>
          <DetailStack renderStack={screens => screens.map(entry => <Fragment key={entry.key}>{entry.element}</Fragment>)}>
            <Bars name="message" />
          </DetailStack>
        </DuoPage>
      </DuoTestProvider>,
    );
    await act(() => fireEvent.press(screen.getByTestId('open-message')));
    const strip = screen.getByTestId(DUO_PAGE_STRIP_TESTID);
    expect(strip).toContainElement(screen.getByTestId('bar-message+'));
    expect(strip).not.toContainElement(screen.getByTestId('bar-message'));
  });
});
