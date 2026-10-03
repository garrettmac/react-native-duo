import {act, render, renderHook, screen} from '@testing-library/react-native';
import {Dimensions, StyleSheet, Text} from 'react-native';
import type {ReactNode} from 'react';

import {ARRANGEMENT_PRIMARY_TESTID, ARRANGEMENT_SECONDARY_TESTID, Arrangement} from '../Arrangement';
import {useDuo} from '../context';
import {DuoProvider} from '../DuoProvider';
import {useBarInsets, useReservedRegions, useSizeClass, useVerticalBarEdge} from '../hooks';
import {loadObserverView} from '../native';

const realWindow = Dimensions.get('window');

function setWindow(width: number, height: number) {
  Dimensions.set({window: {...realWindow, width, height}});
}

afterEach(async () => {
  await act(async () => {
    Dimensions.set({window: realWindow});
  });
});

const inProvider = ({children}: {children: ReactNode}) => <DuoProvider>{children}</DuoProvider>;

function allHooks() {
  return {
    sizeClass: useSizeClass(),
    edge: useVerticalBarEdge(),
    regions: useReservedRegions({includeInactive: true}),
    insets: useBarInsets(72),
    duo: useDuo(),
  };
}

describe('with no native view in the binary', () => {
  it('finds none under jest', () => {
    expect(loadObserverView()).toBeNull();
  });

  it('DuoProvider renders its children and nothing else visible', async () => {
    await render(
      <DuoProvider>
        <Text>app</Text>
      </DuoProvider>,
    );
    expect(screen.getByText('app')).toBeOnTheScreen();
  });

  it('gives the window size, no regions, a null edge and no insets', async () => {
    setWindow(390, 844);
    const {result} = await renderHook(allHooks, {wrapper: inProvider});
    expect(result.current.sizeClass).toEqual({horizontal: 'compact', vertical: 'regular'});
    expect(result.current.edge).toBeNull();
    expect(result.current.regions).toEqual([]);
    expect(result.current.insets).toEqual({top: 0, bottom: 0, leading: 0, trailing: 0});
    expect(result.current.duo.source).toBe('window');
    expect(result.current.duo.window).toEqual({width: 390, height: 844});
  });

  it('follows the window when it grows', async () => {
    setWindow(390, 844);
    const {result} = await renderHook(allHooks, {wrapper: inProvider});
    await act(async () => {
      setWindow(1024, 768);
    });
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'regular'});
    expect(result.current.duo.window).toEqual({width: 1024, height: 768});
  });

  it('re-reads the height as well as the width: a pinned video shrinks the window and the size class follows', async () => {
    setWindow(1100, 951);
    const {result} = await renderHook(allHooks, {wrapper: inProvider});
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'regular'});
    await act(async () => {
      setWindow(1100, 476);
    });
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'compact'});
    expect(result.current.duo.window).toEqual({width: 1100, height: 476});
    await act(async () => {
      setWindow(530, 951);
    });
    expect(result.current.sizeClass).toEqual({horizontal: 'compact', vertical: 'regular'});
  });

  it('gives the same answers with no provider at all', async () => {
    setWindow(844, 390);
    const {result} = await renderHook(allHooks);
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'compact'});
    expect(result.current.edge).toBeNull();
    expect(result.current.regions).toEqual([]);
    expect(result.current.duo.source).toBe('window');
  });

  it('lays an Arrangement out against the window with no regions', async () => {
    setWindow(1024, 768);
    await render(
      <DuoProvider>
        <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />
      </DuoProvider>,
    );
    const primary = StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_PRIMARY_TESTID).props.style);
    const secondary = StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_SECONDARY_TESTID).props.style);
    expect(primary).toMatchObject({left: 0, top: 0, width: 1024, height: 768, zIndex: 1});
    expect(secondary).toMatchObject({left: 0, top: 0, width: 1024, height: 768, zIndex: 0});
  });

  it('lays a split Arrangement out against the window', async () => {
    setWindow(1024, 768);
    await render(<Arrangement kind="split" primary={<Text>p</Text>} secondary={<Text>s</Text>} />);
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_PRIMARY_TESTID).props.style)).toMatchObject({left: 0, width: 512, height: 768});
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_SECONDARY_TESTID).props.style)).toMatchObject({left: 512, width: 512, height: 768});
  });
});
