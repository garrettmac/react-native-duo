import {render, screen} from '@testing-library/react-native';
import {Text} from 'react-native';

import {useDuo} from '../context';
import {DuoTestProvider} from '../DuoTestProvider';
import {useBarInsets, useReservedRegions, useSizeClass, useVerticalBarEdge} from '../hooks';
import {poses, type PoseName} from '../poses';
import type {ReservedRegion, SizeClass, VerticalBarEdge} from '../types';
import {renderInPose} from './helpers/render-in-pose';

const REGULAR: SizeClass = {horizontal: 'regular', vertical: 'regular'};
const COMPACT_WIDTH: SizeClass = {horizontal: 'compact', vertical: 'regular'};

const expectedSizeClass: Record<PoseName, SizeClass> = {
  phone: COMPACT_WIDTH,
  closed: COMPACT_WIDTH,
  closedLandscape: {horizontal: 'compact', vertical: 'compact'},
  iPad: REGULAR,
  openPortrait: REGULAR,
  openLandscape: REGULAR,
  partlyFolded: REGULAR,
  partlyFoldedTabletop: REGULAR,
  splitHalfLeading: COMPACT_WIDTH,
  splitHalfTrailing: COMPACT_WIDTH,
  pipPinned: {horizontal: 'regular', vertical: 'compact'},
};

const expectedEdge: Record<PoseName, VerticalBarEdge> = {
  phone: null,
  closed: 'trailing',
  closedLandscape: 'trailing',
  iPad: null,
  openPortrait: null,
  openLandscape: 'trailing',
  partlyFolded: 'trailing',
  partlyFoldedTabletop: null,
  splitHalfLeading: 'leading',
  splitHalfTrailing: 'trailing',
  pipPinned: 'trailing',
};

const expectedActive: Record<PoseName, {division: number; occlusion: number}> = {
  phone: {division: 0, occlusion: 0},
  closed: {division: 0, occlusion: 1},
  closedLandscape: {division: 0, occlusion: 1},
  iPad: {division: 0, occlusion: 0},
  openPortrait: {division: 0, occlusion: 0},
  openLandscape: {division: 0, occlusion: 1},
  partlyFolded: {division: 1, occlusion: 1},
  partlyFoldedTabletop: {division: 1, occlusion: 0},
  splitHalfLeading: {division: 0, occlusion: 0},
  splitHalfTrailing: {division: 0, occlusion: 0},
  pipPinned: {division: 0, occlusion: 0},
};

const expectedAll: Record<PoseName, {division: number; occlusion: number}> = {
  phone: {division: 0, occlusion: 0},
  closed: {division: 0, occlusion: 1},
  closedLandscape: {division: 0, occlusion: 1},
  iPad: {division: 0, occlusion: 0},
  openPortrait: {division: 1, occlusion: 1},
  openLandscape: {division: 1, occlusion: 1},
  partlyFolded: {division: 1, occlusion: 1},
  partlyFoldedTabletop: {division: 1, occlusion: 1},
  splitHalfLeading: {division: 0, occlusion: 0},
  splitHalfTrailing: {division: 0, occlusion: 0},
  pipPinned: {division: 1, occlusion: 0},
};

const names = Object.keys(poses) as PoseName[];

function count(regions: ReservedRegion[], kind: ReservedRegion['kind']) {
  return regions.filter(region => region.kind === kind).length;
}

describe.each(names)('hooks in the %s pose', name => {
  it('useSizeClass reads the pose', async () => {
    expect((await renderInPose(name, useSizeClass)).result.current).toEqual(expectedSizeClass[name]);
  });

  it('useVerticalBarEdge reads the pose', async () => {
    expect((await renderInPose(name, useVerticalBarEdge)).result.current).toBe(expectedEdge[name]);
  });

  it('useReservedRegions with no query returns only the active regions of both kinds', async () => {
    const regions = (await renderInPose(name, () => useReservedRegions())).result.current;
    expect(regions.every(region => region.isActive)).toBe(true);
    expect({division: count(regions, 'division'), occlusion: count(regions, 'occlusion')}).toEqual(expectedActive[name]);
  });

  it('useReservedRegions filters by kind', async () => {
    const divisions = (await renderInPose(name, () => useReservedRegions({kind: 'division'}))).result.current;
    const occlusions = (await renderInPose(name, () => useReservedRegions({kind: 'occlusion'}))).result.current;
    expect(divisions).toHaveLength(expectedActive[name].division);
    expect(occlusions).toHaveLength(expectedActive[name].occlusion);
    expect(divisions.every(region => region.kind === 'division')).toBe(true);
    expect(occlusions.every(region => region.kind === 'occlusion')).toBe(true);
  });

  it('useReservedRegions with includeInactive returns the inactive ones too', async () => {
    const regions = (await renderInPose(name, () => useReservedRegions({includeInactive: true}))).result.current;
    expect({division: count(regions, 'division'), occlusion: count(regions, 'occlusion')}).toEqual(expectedAll[name]);
    const divisions = (await renderInPose(name, () => useReservedRegions({kind: 'division', includeInactive: true}))).result.current;
    expect(divisions).toHaveLength(expectedAll[name].division);
  });

  it('useBarInsets keeps the bar width on the bar edge and nothing elsewhere', async () => {
    const insets = (await renderInPose(name, () => useBarInsets(72))).result.current;
    const edge = expectedEdge[name];
    expect(insets).toEqual({top: 0, bottom: 0, leading: edge === 'leading' ? 72 : 0, trailing: edge === 'trailing' ? 72 : 0});
  });
});

describe('useReservedRegions frames', () => {
  it('returns the fold of the partly folded pose with its frame and margins', async () => {
    const [fold] = (await renderInPose('partlyFolded', () => useReservedRegions({kind: 'division'}))).result.current;
    expect(fold).toEqual({
      kind: 'division',
      frame: {x: 530, y: 0, width: 40, height: 951},
      margins: {top: 0, left: 10, bottom: 0, right: 10},
      isActive: true,
    });
  });

  it('returns the same array while nothing it depends on changes', async () => {
    const {result, rerender} = await renderInPose('partlyFolded', () => useReservedRegions({kind: 'division'}));
    const first = result.current;
    await rerender({});
    expect(result.current).toBe(first);
  });
});

describe('hooks follow the app window as it changes', () => {
  function Probe() {
    const sizeClass = useSizeClass();
    const edge = useVerticalBarEdge();
    const {window} = useDuo();
    return <Text testID="probe">{JSON.stringify({sizeClass, edge, window})}</Text>;
  }

  const read = () => JSON.parse(screen.getByTestId('probe').props.children as string);

  it('re-reads under a mounted provider on every pose change, nothing cached at mount', async () => {
    const view = await render(
      <DuoTestProvider pose="openLandscape">
        <Probe />
      </DuoTestProvider>,
    );
    expect(read()).toEqual({sizeClass: REGULAR, edge: 'trailing', window: poses.openLandscape.window});

    await view.rerender(
      <DuoTestProvider pose="splitHalfLeading">
        <Probe />
      </DuoTestProvider>,
    );
    expect(read()).toEqual({sizeClass: COMPACT_WIDTH, edge: 'leading', window: poses.splitHalfLeading.window});

    await view.rerender(
      <DuoTestProvider pose="pipPinned">
        <Probe />
      </DuoTestProvider>,
    );
    expect(read()).toEqual({sizeClass: {horizontal: 'regular', vertical: 'compact'}, edge: 'trailing', window: poses.pipPinned.window});
  });
});
