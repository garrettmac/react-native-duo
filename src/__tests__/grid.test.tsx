import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {DuoTestProvider} from '../DuoTestProvider';
import {evenColumnCount, useEvenColumns} from '../grid';
import type {PoseName} from '../poses';

describe('evenColumnCount', () => {
  it('never returns an odd count above one', () => {
    for (let width = 0; width <= 2000; width += 37) {
      const count = evenColumnCount(width, 150, {gap: 12});
      expect(count === 1 || count % 2 === 0).toBe(true);
    }
  });

  it('draws one column when only one fits, unless asked for more', () => {
    expect(evenColumnCount(290, 300)).toBe(1);
    expect(evenColumnCount(290, 300, {min: 2})).toBe(2);
  });

  it('fits as many even columns as the width allows, up to 4', () => {
    expect(evenColumnCount(300, 150)).toBe(2);
    expect(evenColumnCount(500, 150)).toBe(2);
    expect(evenColumnCount(600, 150)).toBe(4);
    expect(evenColumnCount(2000, 150)).toBe(4);
    expect(evenColumnCount(2000, 150, {max: 6})).toBe(6);
  });
});

describe('useEvenColumns', () => {
  it.each<[PoseName, number]>([
    ['phone', 2],
    ['openPortrait', 4],
  ])('in %s draws %i columns', async (pose, expected) => {
    const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose={pose}>{children}</DuoTestProvider>;
    const {result} = await renderHook(() => useEvenColumns(160, {gap: 12, inset: 32}), {wrapper});
    expect(result.current).toBe(expected);
  });
});
