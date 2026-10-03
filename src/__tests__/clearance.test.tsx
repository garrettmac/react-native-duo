import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {cameraClearance, clearancePadding, maxInsets, NO_CLEARANCE, useCameraClearance} from '../clearance';
import {DuoTestProvider} from '../DuoTestProvider';
import {poses} from '../poses';

describe('cameraClearance', () => {
  it('keeps the outer camera, inset in the top corner, and its margins clear on the top edge of the closed phone', () => {
    expect(cameraClearance(poses.closed.regions, poses.closed.window)).toEqual({...NO_CLEARANCE, top: 64});
  });

  it('ignores divisions and a phone with no regions', () => {
    expect(cameraClearance(poses.partlyFolded.regions.filter(r => r.kind === 'division'), poses.partlyFolded.window)).toEqual(NO_CLEARANCE);
    expect(cameraClearance([], poses.phone.window)).toEqual(NO_CLEARANCE);
  });

  it('gives a region touching two edges to the nearer one', () => {
    const corner = {kind: 'occlusion' as const, frame: {x: 0, y: 0, width: 30, height: 60}, margins: NO_CLEARANCE, isActive: true};
    expect(cameraClearance([corner], {width: 400, height: 800})).toEqual({...NO_CLEARANCE, left: 30});
  });
});

describe('useCameraClearance', () => {
  it('counts the inner camera only when asked to', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="openPortrait">{children}</DuoTestProvider>;
    const quiet = await renderHook(() => useCameraClearance(), {wrapper});
    expect(quiet.result.current).toEqual(NO_CLEARANCE);
    const filming = await renderHook(() => useCameraClearance({includeInactive: true}), {wrapper});
    expect(filming.result.current.top).toBe(48);
  });
});

describe('maxInsets and clearancePadding', () => {
  it('take the larger side and never go under the base', () => {
    expect(maxInsets({top: 1, left: 9, bottom: 0, right: 3}, {top: 4, left: 2, bottom: 5, right: 3})).toEqual({top: 4, left: 9, bottom: 5, right: 3});
    expect(clearancePadding({...NO_CLEARANCE, top: 48}, 16)).toEqual({paddingTop: 48, paddingBottom: 16, paddingLeft: 16, paddingRight: 16});
  });
});
