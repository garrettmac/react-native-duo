import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {DuoTestProvider} from '../DuoTestProvider';
import {poses, type PoseName} from '../poses';
import {columnInsetTop, rowSidePadding, sheetControlsStandVertical, sheetPlacement, useSheetPose, type SheetPlacementPreference} from '../sheet';

function place(pose: PoseName, placement: SheetPlacementPreference = 'automatic', modal = true) {
  const {window, regions, sizeClass} = poses[pose];
  return sheetPlacement({window, regions, regular: sizeClass.horizontal === 'regular', rtl: false, insetTop: 20, topGap: 10, modal, placement});
}

describe('sheetPlacement', () => {
  it('takes the whole width on a compact window', () => {
    expect(place('phone')).toEqual({split: false, x: 0, width: 390, height: 834, y: 10, side: 'full'});
    expect(place('phone', 'automatic', false)).toMatchObject({height: null, y: null});
  });

  it('centers on a regular window by default, as Apple does', () => {
    expect(place('iPad')).toEqual({split: true, x: 256, width: 512, height: 1336, y: 30, side: 'center'});
  });

  it('takes the half it is asked for on a regular window', () => {
    expect(place('iPad', 'trailing')).toMatchObject({x: 512, width: 512, side: 'trailing'});
    expect(place('iPad', 'leading')).toMatchObject({x: 0, width: 512, side: 'leading'});
  });

  it('sits beside an active fold, never across it', () => {
    expect(place('partlyFolded')).toMatchObject({split: true, x: 570, width: 530, side: 'trailing'});
    expect(place('partlyFolded', 'leading')).toMatchObject({x: 0, width: 530, side: 'leading'});
  });
});

describe('sheetControlsStandVertical', () => {
  const closed = poses.closed.sizeClass;
  const open = poses.openLandscape.sizeClass;

  it('stands on the closed phone unless the vertical bar is disabled', () => {
    expect(sheetControlsStandVertical({edge: 'leading', sizeClass: closed, side: 'full'})).toBe(true);
    expect(sheetControlsStandVertical({edge: 'leading', sizeClass: closed, side: 'full', verticalBarBehavior: 'disabled'})).toBe(false);
  });

  it('stands on the open display only in a trailing sheet', () => {
    expect(sheetControlsStandVertical({edge: 'trailing', sizeClass: open, side: 'trailing'})).toBe(true);
    expect(sheetControlsStandVertical({edge: 'trailing', sizeClass: open, side: 'center'})).toBe(false);
    expect(sheetControlsStandVertical({edge: 'trailing', sizeClass: open, side: 'leading'})).toBe(false);
  });

  it('never stands where the system keeps bars horizontal', () => {
    expect(sheetControlsStandVertical({edge: null, sizeClass: poses.phone.sizeClass, side: 'full'})).toBe(false);
  });
});

describe('rowSidePadding', () => {
  it('stops a row short of a camera on the side the panel touches', () => {
    expect(rowSidePadding({top: 0, bottom: 0, left: 40, right: 0}, {x: 0, width: 400}, 400, 16)).toEqual({paddingLeft: 40, paddingRight: 16});
    expect(rowSidePadding({top: 0, bottom: 0, left: 40, right: 0}, {x: 200, width: 200}, 400, 16)).toEqual({paddingLeft: 16, paddingRight: 16});
  });
});

describe('columnInsetTop', () => {
  const {regions} = poses.closed;
  const full = {x: 0, width: 460};
  const column = {regions, placement: full, rtl: false, columnWidth: 44, base: 8};

  it('drops a column standing under the camera below its keep-out', () => {
    expect(columnInsetTop({...column, panelTop: 0, edge: 'trailing'})).toBe(64);
    expect(columnInsetTop({...column, panelTop: 32, edge: 'trailing'})).toBe(32);
  });

  it('leaves a column the camera is not over at its own padding', () => {
    expect(columnInsetTop({...column, panelTop: 0, edge: 'leading'})).toBe(8);
    expect(columnInsetTop({...column, panelTop: 100, edge: 'trailing'})).toBe(8);
    expect(columnInsetTop({...column, placement: {x: 0, width: 300}, panelTop: 0, edge: 'trailing'})).toBe(8);
  });

  it('finds the trailing column on the left in right to left', () => {
    expect(columnInsetTop({...column, panelTop: 0, edge: 'leading', rtl: true})).toBe(64);
  });

  it('ignores inactive cameras', () => {
    const inactive = regions.map(region => ({...region, isActive: false}));
    expect(columnInsetTop({...column, regions: inactive, panelTop: 0, edge: 'trailing'})).toBe(8);
  });
});

describe('useSheetPose', () => {
  it('reads the live pose', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="closed">{children}</DuoTestProvider>;
    const {result} = await renderHook(() => useSheetPose(), {wrapper});
    expect(result.current.vertical).toBe(true);
    expect(result.current.edge).toBe('trailing');
    expect(result.current.placement.side).toBe('full');
    expect(result.current.clearance.top).toBe(64);
    expect(result.current.columnInsetTop).toBe(64);
  });

  it('keeps the column clear of the camera below a top gap, and has no column inset for a row or a card', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="closed">{children}</DuoTestProvider>;
    const {result} = await renderHook(
      () => ({
        gap: useSheetPose({topGap: 32, columnPadding: 12}),
        row: useSheetPose({verticalBarBehavior: 'disabled'}),
        card: useSheetPose({modal: false}),
      }),
      {wrapper},
    );
    expect(result.current.gap.columnInsetTop).toBe(32);
    expect(result.current.row.columnInsetTop).toBeNull();
    expect(result.current.card.columnInsetTop).toBeNull();
  });
});
