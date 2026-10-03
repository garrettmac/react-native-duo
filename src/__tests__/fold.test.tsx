import {render, renderHook, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import {StyleSheet, Text} from 'react-native';

import {DuoTestProvider} from '../DuoTestProvider';
import {activeFold, avoidanceOffset, AvoidReservedRegions, useFold} from '../fold';
import {poses, type PoseName} from '../poses';

describe('activeFold', () => {
  it.each<[PoseName, 'horizontal' | 'vertical' | null]>([
    ['phone', null],
    ['closed', null],
    ['openLandscape', null],
    ['partlyFolded', 'horizontal'],
    ['partlyFoldedTabletop', 'vertical'],
  ])('in %s divides %s', (pose, axis) => {
    expect(activeFold(poses[pose].regions)?.axis ?? null).toBe(axis);
  });
});

describe('useFold', () => {
  it('reads the provider', async () => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose="partlyFolded">{children}</DuoTestProvider>;
    const {result} = await renderHook(() => useFold(), {wrapper});
    expect(result.current).toEqual({frame: {x: 530, y: 0, width: 40, height: 951}, margins: {top: 0, left: 10, bottom: 0, right: 10}, axis: 'horizontal'});
  });
});

describe('avoidanceOffset', () => {
  const {regions} = poses.partlyFolded;

  it('leaves a control clear of the fold where it is', () => {
    expect(avoidanceOffset({x: 100, y: 100, width: 44, height: 44}, regions)).toEqual({x: 0, y: 0});
  });

  it('moves a control on the fold toward the side its center is on, past the margins', () => {
    expect(avoidanceOffset({x: 500, y: 100, width: 44, height: 44}, regions)).toEqual({x: -24, y: 0});
    expect(avoidanceOffset({x: 560, y: 100, width: 44, height: 44}, regions)).toEqual({x: 20, y: 0});
  });

  it('moves a control off a tabletop fold up or down', () => {
    expect(avoidanceOffset({x: 100, y: 520, width: 44, height: 44}, poses.partlyFoldedTabletop.regions)).toEqual({x: 0, y: -44});
  });

  it('ignores an inactive fold', () => {
    expect(avoidanceOffset({x: 530, y: 100, width: 44, height: 44}, poses.openLandscape.regions)).toEqual({x: 0, y: 0});
  });
});

describe('AvoidReservedRegions', () => {
  it('renders its child unmoved before it has laid out', async () => {
    await render(
      <DuoTestProvider pose="partlyFolded">
        <AvoidReservedRegions testID="wrap">
          <Text>Done</Text>
        </AvoidReservedRegions>
      </DuoTestProvider>,
    );
    expect(StyleSheet.flatten(screen.getByTestId('wrap').props.style).transform).toEqual([{translateX: 0}, {translateY: 0}]);
    expect(screen.getByText('Done')).toBeTruthy();
  });
});
