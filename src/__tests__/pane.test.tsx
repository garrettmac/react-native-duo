import {render, renderHook, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import {I18nManager, StyleSheet, Text} from 'react-native';

import {DuoTestProvider} from '../DuoTestProvider';
import {ALL_EDGES, PANE_LEADING_TESTID, PANE_TRAILING_TESTID, PaneLayout, PaneProvider, sidebarParts, sidebarWidth, usePane, useSplitWindow, type PaneArrangement} from '../pane';
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
    expect(result.current).toEqual({split: false, side: 'only', x: 0, y: 0, width: 1024, height: 1366, hidden: false, edges: ALL_EDGES});
  });

  it('reads the edges a provided pane reaches from where it sits when the provider names none', async () => {
    const wrapper = ({children}: {children: ReactNode}) => (
      <DuoTestProvider pose="iPad">
        <PaneProvider pane={{split: true, side: 'trailing', x: 512, y: 0, width: 512, height: 1366, hidden: false}}>{children}</PaneProvider>
      </DuoTestProvider>
    );
    const {result} = await renderHook(() => usePane(), {wrapper});
    expect(result.current.edges).toEqual({top: true, bottom: true, left: false, right: true});
  });
});

describe('PaneLayout', () => {
  it('layers an overlay on a phone, both panes the whole window', async () => {
    await renderLayout('phone', 'sheet');
    expect(paneOf('leading')).toEqual({split: false, side: 'only', x: 0, y: 0, width: 390, height: 844, hidden: false, edges: ALL_EDGES});
    expect(paneOf('trailing')).toEqual({split: false, side: 'only', x: 0, y: 0, width: 390, height: 844, hidden: false, edges: ALL_EDGES});
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

describe('the edges each pane reaches', () => {
  it('names the three edges of the box a side-by-side pane reaches', async () => {
    await renderLayout('openLandscape', 'list-detail');
    expect(paneOf('leading').edges).toEqual({top: true, bottom: true, left: true, right: false});
    expect(paneOf('trailing').edges).toEqual({top: true, bottom: true, left: false, right: true});
  });

  it('names the top or the bottom either side of a tabletop fold', async () => {
    await renderLayout('partlyFoldedTabletop', 'side-by-side');
    expect(paneOf('leading').edges).toEqual({top: true, bottom: false, left: true, right: true});
    expect(paneOf('trailing').edges).toEqual({top: false, bottom: true, left: true, right: true});
  });

  it('gives every edge to both layers of a sheet over its map', async () => {
    await renderLayout('phone', 'sheet');
    expect(paneOf('leading').edges).toEqual(ALL_EDGES);
    expect(paneOf('trailing').edges).toEqual(ALL_EDGES);
  });
});

describe('the edges each pane reaches, right to left', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [true, {left: true, right: false}, {left: false, right: true}],
    [false, {left: false, right: true}, {left: true, right: false}],
  ])('names them as a style does when React Native swaps sides: %s', async (swap, leading, trailing) => {
    jest.replaceProperty(I18nManager, 'isRTL', true);
    const constants = I18nManager.getConstants();
    jest.spyOn(I18nManager, 'getConstants').mockReturnValue({...constants, isRTL: true, doLeftAndRightSwapInRTL: swap});
    await renderLayout('openLandscape', 'list-detail');
    expect(paneOf('leading').edges).toMatchObject(leading);
    expect(paneOf('trailing').edges).toMatchObject(trailing);
    await render(
      <DuoTestProvider pose="openLandscape">
        <PaneProvider pane={{split: true, side: 'leading', x: 550, y: 0, width: 550, height: 951, hidden: false}}>
          <PaneReport name="placed" />
        </PaneProvider>
      </DuoTestProvider>,
    );
    expect(paneOf('placed').edges).toMatchObject(leading);
  });
});

describe('a nested PaneLayout', () => {
  it('keeps one pane in half of the open Duo, narrower than minSplitWidth', async () => {
    await render(
      <DuoTestProvider pose="openLandscape">
        <PaneProvider pane={{split: true, side: 'leading', x: 0, y: 0, width: 530, height: 951, hidden: false}}>
          <PaneLayout arrangement="list-detail" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
        </PaneProvider>
      </DuoTestProvider>,
    );
    expect(paneOf('leading')).toMatchObject({split: false, width: 530});
  });
});

describe('a PaneLayout in a hidden pane', () => {
  it('hides both of its panes, so neither hosts bars in the strip', async () => {
    await render(
      <DuoTestProvider pose="openLandscape">
        <PaneProvider pane={{split: false, side: 'only', x: 0, y: 0, width: 1100, height: 951, hidden: true}}>
          <PaneLayout arrangement="list-detail" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
        </PaneProvider>
      </DuoTestProvider>,
    );
    expect(paneOf('leading')).toMatchObject({split: true, hidden: true});
    expect(paneOf('trailing')).toMatchObject({split: true, hidden: true});
    expect(styleOf(PANE_LEADING_TESTID).display).toBeUndefined();
    expect(styleOf(PANE_TRAILING_TESTID).display).toBeUndefined();
  });
});

describe('a box narrower than its window', () => {
  const sheet = (children: ReactNode) => (
    <DuoTestProvider pose="iPad">
      <PaneProvider pane={{split: false, side: 'only', x: 160, y: 100, width: 704, height: 1166, hidden: false}}>{children}</PaneProvider>
    </DuoTestProvider>
  );

  it('splits a list and its detail when it is at least minSplitWidth wide', async () => {
    await render(sheet(<PaneLayout arrangement="list-detail" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />));
    expect(paneOf('leading')).toMatchObject({split: true});
  });

  it('keeps one pane in a box narrower than minSplitWidth, like a page sheet on an iPad', async () => {
    await render(sheet(<PaneLayout arrangement="list-detail" minSplitWidth={744} leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />));
    expect(paneOf('leading')).toMatchObject({split: false, hidden: false, width: 704});
    expect(paneOf('trailing')).toMatchObject({split: false, hidden: true});
  });

  it('keeps one pane in a form sheet narrower than the regular width by default', async () => {
    await render(
      <DuoTestProvider pose="iPad">
        <PaneProvider pane={{split: false, side: 'only', x: 242, y: 373, width: 540, height: 620, hidden: false}}>
          <PaneLayout arrangement="list-detail" leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
        </PaneProvider>
      </DuoTestProvider>,
    );
    expect(paneOf('leading')).toMatchObject({split: false});
  });
});

describe('a docked sheet', () => {
  it('sits beside its map in halves on a regular window, portrait included', async () => {
    for (const pose of ['iPad', 'openPortrait'] as PoseName[]) {
      await render(
        <DuoTestProvider pose={pose}>
          <PaneLayout arrangement="sheet" dock leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
        </DuoTestProvider>,
      );
      expect(paneOf('leading')).toMatchObject({split: true, side: 'leading', hidden: false});
      expect(paneOf('trailing')).toMatchObject({split: true, side: 'trailing', hidden: false});
    }
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 476});
  });

  it('still takes a side of an active fold', async () => {
    await render(
      <DuoTestProvider pose="partlyFolded">
        <PaneLayout arrangement="sheet" dock leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 530});
    expect(styleOf(PANE_TRAILING_TESTID)).toMatchObject({left: 570, width: 530});
  });

  it('stays over its map on a phone and in a box narrower than minSplitWidth', async () => {
    await render(
      <DuoTestProvider pose="phone">
        <PaneLayout arrangement="sheet" dock leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(paneOf('trailing')).toMatchObject({split: false, hidden: false});
    await render(
      <DuoTestProvider pose="iPad">
        <PaneLayout arrangement="sheet" dock minSplitWidth={1100} leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(paneOf('trailing')).toMatchObject({split: false, hidden: false});
  });
});

describe('a list and its detail at half the width', () => {
  it('splits in the same halves as any split without a fold', async () => {
    await render(
      <DuoTestProvider pose="iPad">
        <PaneLayout arrangement="list-detail" leadingFraction={0.5} leading={<PaneReport name="leading" />} trailing={<PaneReport name="trailing" />} />
      </DuoTestProvider>,
    );
    expect(styleOf(PANE_LEADING_TESTID)).toMatchObject({left: 0, width: 512});
    expect(styleOf(PANE_TRAILING_TESTID)).toMatchObject({left: 512, width: 512});
  });
});
