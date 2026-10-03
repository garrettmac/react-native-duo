import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import * as api from '../index';
import {useSizeClass, useVerticalBarEdge} from '../index';
import * as layout from '../layout';
import * as testing from '../testing';
import {DuoTestProvider, poses, type Pose} from '../testing';

describe('the public API', () => {
  it('keeps the root to what an app uses', () => {
    expect(Object.keys(api).sort()).toEqual([
      'AvoidReservedRegions',
      'DetailStack',
      'DuoBar',
      'DuoPage',
      'DuoProvider',
      'PaneLayout',
      'barGroups',
      'clearancePadding',
      'forwardCamera',
      'shouldMirror',
      'useBarInsets',
      'useCameraClearance',
      'useCameraDirections',
      'useDetailStack',
      'useDuo',
      'useEvenColumns',
      'useFold',
      'usePage',
      'usePane',
      'useReservedRegions',
      'useSheetPose',
      'useSizeClass',
      'useSplitWindow',
      'useVerticalBar',
      'useVerticalBarEdge',
    ]);
  });

  it('puts the building blocks under /layout', () => {
    expect(Object.keys(layout).sort()).toEqual([
      'ARRANGEMENT_PRIMARY_TESTID',
      'ARRANGEMENT_SECONDARY_TESTID',
      'ARRANGEMENT_TESTID',
      'Arrangement',
      'DETAIL_STACK_TESTID',
      'DUO_BAR_TESTID',
      'DUO_PAGE_CONTENT_TESTID',
      'DUO_PAGE_STRIP_TESTID',
      'DUO_PAGE_TESTID',
      'NO_CLEARANCE',
      'PANE_LAYOUT_TESTID',
      'PANE_LEADING_TESTID',
      'PANE_TRAILING_TESTID',
      'PaneProvider',
      'REGULAR_HEIGHT_MIN_DP',
      'REGULAR_WIDTH_MIN_DP',
      'activeDivision',
      'activeFold',
      'arrangementLayout',
      'avoidanceOffset',
      'cameraClearance',
      'detailShowsBack',
      'evenColumnCount',
      'maxInsets',
      'pageMode',
      'placedFrame',
      'rowSidePadding',
      'sheetControlsStandVertical',
      'sheetPlacement',
      'sidebarParts',
      'sidebarWidth',
      'sizeClassFromWindow',
      'splitParts',
      'touchesEdge',
      'useArrangementBox',
      'usePaneBarEdge',
      'verticalBarLayout',
    ]);
  });

  it('puts the test kit under /testing', () => {
    expect(Object.keys(testing).sort()).toEqual([
      'DuoTestProvider',
      'POSE_NAMES',
      'poses',
    ]);
  });
});

describe('DuoTestProvider', () => {
  it('takes a pose of your own', async () => {
    const mine: Pose = {...poses.phone, name: 'phone', sizeClass: {horizontal: 'regular', vertical: 'compact'}, verticalBarEdge: 'leading'};
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose={mine}>{children}</DuoTestProvider>;
    const {result} = await renderHook(() => ({sizeClass: useSizeClass(), edge: useVerticalBarEdge()}), {wrapper});
    expect(result.current).toEqual({sizeClass: {horizontal: 'regular', vertical: 'compact'}, edge: 'leading'});
  });
});
