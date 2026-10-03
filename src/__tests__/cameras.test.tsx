import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {forwardCamera, shouldMirror, useCameraDirections} from '../cameras';
import {DuoTestProvider} from '../DuoTestProvider';
import {parseCameraDirections} from '../snapshot';
import type {CameraDirections} from '../types';

const inner = {uniqueID: 'inner', localizedName: 'Inner Camera', deviceType: 'AVCaptureDeviceTypeBuiltInInnerUltraWideCamera', position: 'front' as const};
const outer = {uniqueID: 'outer', localizedName: 'Outer Camera', deviceType: 'AVCaptureDeviceTypeBuiltInOuterUltraWideCamera', position: 'front' as const};
const rear = {uniqueID: 'rear', localizedName: 'Back Camera', deviceType: 'AVCaptureDeviceTypeBuiltInDualWideCamera', position: 'back' as const};
const open: CameraDirections = {forward: [inner], backward: [outer, rear], source: 'native'};
const closedRearFacingYou: CameraDirections = {forward: [outer, rear], backward: [inner], source: 'native'};

describe('useCameraDirections', () => {
  it('reports nothing without a native coordinator', async () => {
    const {result} = await renderHook(() => useCameraDirections());
    expect(result.current).toEqual({forward: [], backward: [], source: 'unavailable'});
  });

  it('reports what the test provider is given', async () => {
    const wrapper = ({children}: {children: ReactNode}) => (
      <DuoTestProvider pose="openPortrait" cameras={open}>
        {children}
      </DuoTestProvider>
    );
    const {result} = await renderHook(() => useCameraDirections(), {wrapper});
    expect(result.current.forward).toEqual([inner]);
  });
});

describe('forwardCamera and shouldMirror', () => {
  it('keeps a camera that still faces the person and replaces one that does not', () => {
    expect(forwardCamera(closedRearFacingYou, 'rear')?.uniqueID).toBe('rear');
    expect(forwardCamera(closedRearFacingYou, 'inner')?.uniqueID).toBe('outer');
    expect(forwardCamera({forward: [], backward: [], source: 'native'}, 'inner')).toBeNull();
  });

  it('mirrors by direction, not position', () => {
    expect(shouldMirror(rear, closedRearFacingYou)).toBe(true);
    expect(shouldMirror(outer, open)).toBe(false);
  });
});

describe('parseCameraDirections', () => {
  it('reads a payload and refuses a malformed one', () => {
    expect(parseCameraDirections({forward: [inner], backward: []})).toEqual({forward: [inner], backward: [], source: 'native'});
    expect(parseCameraDirections({forward: [{}], backward: []})).toBeNull();
    expect(parseCameraDirections(null)).toBeNull();
  });
});
