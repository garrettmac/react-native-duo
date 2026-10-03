import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {DuoTestProvider} from '../DuoTestProvider';
import {poses, type PoseName} from '../poses';
import {rowSidePadding, sheetControlsStandVertical, sheetPlacement, useSheetPose, type SheetPlacementPreference} from '../sheet';

function place(pose: PoseName, placement: SheetPlacementPreference = 'automatic', modal = true) {
  const {window, regions, sizeClass} = poses[pose];
  return sheetPlacement({window, regions, regular: sizeClass.horizontal === 'regular', rtl: false, insetTop: 20, topGap: 10, modal, placement});
}

describe('sheetPlacement', () => {
  it('takes the whole width on a compact window', () => {
    expect(place('phone')).toEqual({split: false, x: 0, width: 390, height: 834, side: 'full'});
    expect(place('phone', 'automatic', false).height).toBeNull();
  });

  it('centers on a regular window by default, as Apple does', () => {
    expect(place('iPad')).toEqual({split: true, x: 256, width: 512, height: 1336, side: 'center'});
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

describe('useSheetPose', () => {
  it('reads the live pose', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="closed">{children}</DuoTestProvider>;
    const {result} = await renderHook(() => useSheetPose(), {wrapper});
    expect(result.current.vertical).toBe(true);
    expect(result.current.edge).toBe('trailing');
    expect(result.current.placement.side).toBe('full');
    expect(result.current.clearance.top).toBe(64);
  });
});
