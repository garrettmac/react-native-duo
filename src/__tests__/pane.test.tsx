import {render, renderHook, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import {StyleSheet, Text} from 'react-native';

import {DuoTestProvider} from '../DuoTestProvider';
import {PANE_LEADING_TESTID, PANE_TRAILING_TESTID, PaneLayout, sidebarParts, sidebarWidth, usePane, useSplitWindow, type PaneArrangement} from '../pane';
import type {PoseName} from '../poses';

function PaneReport({name}: {name: string}) {
  const pane = usePane();
  return <Text testID={`report-${name}`}>{JSON.stringify(pane)}</Text>;
}

function paneOf(name: string) {
  return JSON.parse(String(screen.getByTestId(`report-${name}`, {includeHiddenElements: true}).props.children));
}

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID, {includeHiddenElements: true}).props.style);
}

async function renderLayout(pose: PoseName, arrangement: PaneArrangement, compact?: 'leading' | 'trailing') {
  await render(
    <DuoTestProvider pose={pose}>
      <PaneLayout arrangement={arrangement} compact={compact} leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
    </DuoTestProvider>,
  );
}

describe('usePane', () => {
  it('is the whole window outside a PaneLayout', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="iPad">{children}</DuoTestProvider>;
    const {result} = await renderHook(() => usePane(), {wrapper});
    expect(result.current).toEqual({split: false, side: 'only', x: 0, y: 0, width: 1024, height: 1366, hidden: false});
  });
});

describe('PaneLayout', () => {
  it('layers an overlay on a phone, both panes the whole window', async () => {
    await renderLayout('phone', 'sheet');
    expect(paneOf('leading')).toEqual({split: false, side: 'only', x: 0, y: 0, width: 390, height: 844, hidden: false});
    expect(paneOf('trailing')).toEqual({split: false, side: 'only', x: 0, y: 0, width: 390, height: 844, hidden: false});
  });

  it('keeps a sheet over the map on an iPad and the open iPhone Duo, like Apple’s overlay arrangement', async () => {
    for (const pose of ['iPad', 'openLandscape'] as PoseName[]) {
      await renderLayout(pose, 'sheet');
      expect(paneOf('leading')).toMatchObject({split: false, side: 'only'});
      expect(paneOf('trailing')).toMatchObject({split: false, side: 'only'});
    }
  });

  it('puts a list and its detail side by side on an iPad', async () => {
    await renderLayout('iPad', 'list-detail');
    expect(paneOf('leading')).toMatchObject({split: true, side: 'leading', width: 358});
    expect(paneOf('trailing')).toMatchObject({split: true, side: 'trailing', width: 666});
  });

  it('keeps both panes clear of an active fold', async () => {
    await renderLayout('partlyFolded', 'sheet');
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 530});
    expect(styleOf(PANE_TRAILING_TESTID)).toMatchObject({left: 570, width: 530});
  });

  it('stacks a split either side of a tabletop fold', async () => {
    await renderLayout('partlyFoldedTabletop', 'side-by-side');
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({top: 0, height: 530});
    expect(styleOf(PANE_TRAILING_TESTID)).toMatchObject({top: 570, height: 530});
  });

  it('shows one pane of a split view on a compact window and keeps the other mounted', async () => {
    await renderLayout('closed', 'list-detail');
    expect(paneOf('trailing')).toMatchObject({hidden: true});
    expect(styleOf(PANE_TRAILING_TESTID).display).toBe('none');
    await renderLayout('closed', 'list-detail', 'trailing');
    expect(paneOf('leading')).toMatchObject({hidden: true});
  });

  it('shows a split view side by side on the open Duo', async () => {
    await renderLayout('openLandscape', 'list-detail');
    expect(paneOf('leading')).toMatchObject({split: true, hidden: false});
    expect(paneOf('trailing')).toMatchObject({split: true, hidden: false});
  });
});

describe('useSplitWindow', () => {
  it.each<[PoseName, boolean]>([
    ['phone', false],
    ['closed', false],
    ['splitHalfLeading', false],
    ['openPortrait', true],
    ['partlyFolded', true],
    ['iPad', true],
  ])('in %s is %s', async (pose, expected) => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose={pose}>{children}</DuoTestProvider>;
    const {result} = await renderHook(() => useSplitWindow(), {wrapper});
    expect(result.current).toBe(expected);
  });
});

describe('list and detail widths', () => {
  it('gives the list about a third when fully open and halves at the fold, like Notes', async () => {
    await renderLayout('openLandscape', 'list-detail');
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 385});
    expect(styleOf(PANE_TRAILING_TESTID)).toMatchObject({left: 385, width: 715});
    await renderLayout('partlyFolded', 'list-detail');
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 530});
  });

  it('keeps the list within its minimum and half, and on the right in right to left', () => {
    expect(sidebarWidth(1100)).toBe(385);
    expect(sidebarWidth(700)).toBe(320);
    expect(sidebarWidth(500)).toBe(250);
    expect(sidebarWidth(1100, {fraction: 0.25, min: 200, max: 260})).toBe(260);
    expect(sidebarParts({width: 1000, height: 500}, 300, true)).toEqual([
      {x: 700, y: 0, width: 300, height: 500},
      {x: 0, y: 0, width: 700, height: 500},
    ]);
  });

  it('can be forced to one pane or two', async () => {
    await render(
      <DuoTestProvider pose="iPad">
        <PaneLayout split="never" arrangement="list-detail" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(paneOf('leading')).toMatchObject({split: false});
    await render(
      <DuoTestProvider pose="phone">
        <PaneLayout split="always" arrangement="side-by-side" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(paneOf('leading')).toMatchObject({split: true, height: 422});
  });
});
