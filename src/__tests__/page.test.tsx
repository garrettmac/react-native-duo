import {render, screen} from '@testing-library/react-native';
import {useState} from 'react';
import {Text} from 'react-native';

import {DuoTestProvider} from '../DuoTestProvider';
import {DUO_PAGE_STRIP_TESTID, DuoPage, pageMode, touchesEdge, usePage, type BarPlacement} from '../page';
import {PaneLayout} from '../pane';
import type {PoseName} from '../poses';

const top = (placement: BarPlacement) => <Text testID={`top-${placement.position}`}>Back</Text>;
const bottom = (placement: BarPlacement) => <Text testID={`tabs-${placement.position}`}>Tabs</Text>;

function Mode({name}: {name: string}) {
  const page = usePage();
  return <Text testID={`mode-${name}`}>{`${page.mode} ${page.edge}`}</Text>;
}

async function renderPage(pose: PoseName) {
  await render(
    <DuoTestProvider pose={pose}>
      <DuoPage topBar={top} bottomBar={bottom}>
        <Mode name="page" />
      </DuoPage>
    </DuoTestProvider>,
  );
}

const text = (testID: string) => String(screen.getByTestId(testID).props.children);

describe('touchesEdge and pageMode', () => {
  const window = {x: 0, y: 0, width: 1100, height: 951};

  it('stands bars only for a box at the top of the window on the edge the system names', () => {
    expect(touchesEdge({x: 385, y: 0, width: 715, height: 951}, window, 'trailing', false)).toBe(true);
    expect(touchesEdge({x: 0, y: 0, width: 385, height: 951}, window, 'trailing', false)).toBe(false);
    expect(touchesEdge({x: 0, y: 0, width: 385, height: 951}, window, 'trailing', true)).toBe(true);
    expect(touchesEdge({x: 0, y: 476, width: 1100, height: 475}, window, 'trailing', false)).toBe(false);
  });

  it('gives a nested page touching the strip to the strip and keeps the rest in place', () => {
    const host = {edge: 'trailing' as const, frame: {x: 0, y: 0, width: 1036, height: 951}};
    expect(pageMode({edge: 'trailing', pane: {x: 385, y: 0, width: 651, height: 951}, window, host, rtl: false})).toBe('hosted');
    expect(pageMode({edge: 'trailing', pane: {x: 0, y: 0, width: 385, height: 951}, window, host, rtl: false})).toBe('horizontal');
    expect(pageMode({edge: null, pane: window, window, host: null, rtl: false})).toBe('horizontal');
    expect(pageMode({edge: 'leading', pane: window, window, host: null, rtl: false})).toBe('side');
  });
});

describe('DuoPage', () => {
  it.each<PoseName>(['phone', 'iPad', 'openPortrait', 'partlyFoldedTabletop'])('is a plain column with the bars in place on %s', async pose => {
    await renderPage(pose);
    expect(screen.getByTestId('top-top')).toBeTruthy();
    expect(screen.getByTestId('tabs-bottom')).toBeTruthy();
    expect(screen.queryByTestId(DUO_PAGE_STRIP_TESTID)).toBeNull();
    expect(text('mode-page')).toBe('horizontal null');
  });

  it.each<PoseName>(['closed', 'closedLandscape', 'openLandscape', 'splitHalfLeading', 'splitHalfTrailing'])('moves both bars into one strip on %s', async pose => {
    await renderPage(pose);
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).toBeTruthy();
    expect(screen.getByTestId('top-side')).toBeTruthy();
    expect(screen.getByTestId('tabs-side')).toBeTruthy();
    expect(screen.queryByTestId('top-top')).toBeNull();
  });

  it('puts the strip on the edge the system names', async () => {
    await renderPage('splitHalfLeading');
    expect(text('mode-page')).toBe('side leading');
  });

  it('draws the side replacements when given', async () => {
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage topBar={<Text>Top</Text>} sideTopBar={<Text testID="side-top">Side</Text>}>
          <Text>Body</Text>
        </DuoPage>
      </DuoTestProvider>,
    );
    expect(screen.getByTestId('side-top')).toBeTruthy();
    expect(screen.queryByText('Top')).toBeNull();
  });

  it('can be forced either way', async () => {
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage mode="horizontal" topBar={top}>
          <Mode name="forced" />
        </DuoPage>
      </DuoTestProvider>,
    );
    expect(screen.getByTestId('top-top')).toBeTruthy();
    expect(text('mode-forced')).toBe('horizontal null');
  });

  it('lets a custom strip draw what goes in it', async () => {
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage topBar={top} bottomBar={bottom} renderSide={side => <Text testID="custom-strip">{`${side.edge} ${side.top.length} ${side.bottom.length}`}</Text>}>
          <Text>Body</Text>
        </DuoPage>
      </DuoTestProvider>,
    );
    expect(text('custom-strip')).toBe('trailing 1 1');
  });

  it('leaves a hidden pane’s bars out of the strip', async () => {
    await render(
      <DuoTestProvider pose="closed">
        <DuoPage bottomBar={bottom}>
          <PaneLayout
            arrangement="list-detail"
            compact="trailing"
            leading={
              <DuoPage topBar={<Text testID="list-bar">Filter</Text>}>
                <Mode name="list" />
              </DuoPage>
            }
            trailing={
              <DuoPage topBar={<Text testID="detail-bar">Reply</Text>}>
                <Mode name="detail" />
              </DuoPage>
            }
          />
        </DuoPage>
      </DuoTestProvider>,
    );
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).toContainElement(screen.getByTestId('detail-bar'));
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).not.toContainElement(screen.queryByTestId('list-bar', {includeHiddenElements: true}));
  });

  it('keeps the list pane’s bar on top and gives the detail pane’s bar to the strip when open', async () => {
    await render(
      <DuoTestProvider pose="openLandscape">
        <DuoPage bottomBar={bottom}>
          <PaneLayout
            arrangement="list-detail"
            leading={
              <DuoPage topBar={<Text testID="list-bar">Filter</Text>}>
                <Mode name="list" />
              </DuoPage>
            }
            trailing={
              <DuoPage topBar={<Text testID="detail-bar">Reply</Text>}>
                <Mode name="detail" />
              </DuoPage>
            }
          />
        </DuoPage>
      </DuoTestProvider>,
    );
    expect(text('mode-list')).toBe('horizontal null');
    expect(text('mode-detail')).toBe('hosted trailing');
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).toContainElement(screen.getByTestId('detail-bar'));
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).not.toContainElement(screen.getByTestId('list-bar'));
  });
});

describe('DuoPage keeps its content mounted when the pose moves the bars', () => {
  let mounts = 0;
  function Draft() {
    useState(() => {
      mounts += 1;
      return '';
    });
    return <Mode name="draft" />;
  }
  beforeEach(() => {
    mounts = 0;
  });

  it('between a column and its own strip (horizontal and side)', async () => {
    const tree = (pose: PoseName) => (
      <DuoTestProvider pose={pose}>
        <DuoPage topBar={top} bottomBar={bottom}>
          <Draft />
        </DuoPage>
      </DuoTestProvider>
    );
    await render(tree('closed'));
    expect(text('mode-draft')).toBe('side trailing');
    await screen.rerender(tree('openPortrait'));
    expect(text('mode-draft')).toBe('horizontal null');
    await screen.rerender(tree('openLandscape'));
    await screen.rerender(tree('closed'));
    expect(text('mode-draft')).toBe('side trailing');
    expect(mounts).toBe(1);
  });

  it('between the strip around it and a column (hosted and horizontal)', async () => {
    const tree = (pose: PoseName) => (
      <DuoTestProvider pose={pose}>
        <DuoPage bottomBar={bottom}>
          <DuoPage topBar={top}>
            <Draft />
          </DuoPage>
        </DuoPage>
      </DuoTestProvider>
    );
    await render(tree('closed'));
    expect(text('mode-draft')).toBe('hosted trailing');
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).toContainElement(screen.getByTestId('top-side'));
    await screen.rerender(tree('openPortrait'));
    expect(text('mode-draft')).toBe('horizontal null');
    expect(screen.getByTestId('top-top')).toBeTruthy();
    await screen.rerender(tree('closed'));
    expect(text('mode-draft')).toBe('hosted trailing');
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).toContainElement(screen.getByTestId('top-side'));
    expect(mounts).toBe(1);
  });

  it('between its own strip and the strip around it (side and hosted)', async () => {
    const tree = (shareSide: boolean) => (
      <DuoTestProvider pose="closed">
        <DuoPage bottomBar={bottom}>
          <DuoPage topBar={top} shareSide={shareSide} mode="side">
            <Draft />
          </DuoPage>
        </DuoPage>
      </DuoTestProvider>
    );
    await render(tree(true));
    expect(text('mode-draft')).toBe('hosted trailing');
    await screen.rerender(tree(false));
    expect(text('mode-draft')).toBe('side trailing');
    await screen.rerender(tree(true));
    expect(text('mode-draft')).toBe('hosted trailing');
    expect(mounts).toBe(1);
  });

  it('keeps a page that does not share the strip in its own pane, bars and all, in every pose', async () => {
    let composers = 0;
    function Composer() {
      useState(() => {
        composers += 1;
        return '';
      });
      return <Text testID="composer">Message</Text>;
    }
    const tree = (pose: PoseName) => (
      <DuoTestProvider pose={pose}>
        <DuoPage bottomBar={bottom}>
          <DuoPage shareSide={false} topBar={top} bottomBar={<Composer />}>
            <Draft />
          </DuoPage>
        </DuoPage>
      </DuoTestProvider>
    );
    await render(tree('closed'));
    expect(text('mode-draft')).toBe('horizontal null');
    expect(screen.getByTestId(DUO_PAGE_STRIP_TESTID)).not.toContainElement(screen.getByTestId('composer'));
    await screen.rerender(tree('openLandscape'));
    expect(text('mode-draft')).toBe('horizontal null');
    await screen.rerender(tree('closed'));
    expect(text('mode-draft')).toBe('horizontal null');
    expect(mounts).toBe(1);
    expect(composers).toBe(1);
  });
});
