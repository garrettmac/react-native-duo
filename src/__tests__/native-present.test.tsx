import {act, render, renderHook, screen} from '@testing-library/react-native';
import {requireNativeView, requireOptionalNativeModule} from 'expo';
import {useEffect, type ReactNode} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';

import {ARRANGEMENT_PRIMARY_TESTID, ARRANGEMENT_SECONDARY_TESTID, Arrangement} from '../Arrangement';
import {useDuo} from '../context';
import {DuoProvider} from '../DuoProvider';
import {useReservedRegions, useSizeClass, useVerticalBarEdge} from '../hooks';
import {DUO_NATIVE_MODULE, DUO_NATIVE_VIEW, loadObserverView, type DuoObserverViewProps} from '../native';
import {poses} from '../poses';

jest.mock('expo', () => ({requireOptionalNativeModule: jest.fn(), requireNativeView: jest.fn()}));

const mockedModule = requireOptionalNativeModule as jest.Mock;
const mockedView = requireNativeView as jest.Mock;

let latest: DuoObserverViewProps | null = null;
let observerMounts = 0;

function FakeObserver(props: DuoObserverViewProps) {
  latest = props;
  useEffect(() => {
    observerMounts += 1;
  }, []);
  return <View testID="observer" />;
}

const realWindow = Dimensions.get('window');

beforeEach(() => {
  latest = null;
  observerMounts = 0;
  mockedModule.mockReset().mockReturnValue({});
  mockedView.mockReset().mockReturnValue(FakeObserver);
  Dimensions.set({window: {...realWindow, width: 1100, height: 951}});
});

afterEach(async () => {
  await act(async () => {
    Dimensions.set({window: realWindow});
  });
});

const inProvider = ({children}: {children: ReactNode}) => <DuoProvider>{children}</DuoProvider>;

function emit(payload: unknown) {
  return act(async () => {
    latest?.onDuoChange({nativeEvent: payload});
  });
}

const foldedPayload = {
  sizeClass: poses.partlyFolded.sizeClass,
  verticalBarEdge: poses.partlyFolded.verticalBarEdge,
  regions: poses.partlyFolded.regions,
};

describe('loadObserverView', () => {
  it('asks for the view of the module by name', () => {
    expect(loadObserverView()).toBe(FakeObserver);
    expect(mockedModule).toHaveBeenCalledWith(DUO_NATIVE_MODULE);
    expect(mockedView).toHaveBeenCalledWith(DUO_NATIVE_MODULE, DUO_NATIVE_VIEW);
  });

  it('is null when the module is not in the binary, without asking for the view', () => {
    mockedModule.mockReturnValue(null);
    expect(loadObserverView()).toBeNull();
    expect(mockedView).not.toHaveBeenCalled();
  });

  it('is null when the module has no such view, and does not throw', () => {
    mockedView.mockImplementation(() => {
      throw new Error('no view');
    });
    expect(loadObserverView()).toBeNull();
  });
});

describe('DuoProvider with the native view', () => {
  it('mounts the observer once, filling the root and taking no touches', async () => {
    await render(
      <DuoProvider>
        <Text>app</Text>
      </DuoProvider>,
    );
    expect(screen.getAllByTestId('observer')).toHaveLength(1);
    expect(latest?.pointerEvents).toBe('none');
    expect(latest?.style).toBe(StyleSheet.absoluteFill);
    expect(screen.getByText('app')).toBeOnTheScreen();
  });

  it('keeps the same observer across re-renders and window changes', async () => {
    const view = await render(<DuoProvider><Text>app</Text></DuoProvider>);
    await view.rerender(<DuoProvider><Text>app again</Text></DuoProvider>);
    await act(async () => {
      Dimensions.set({window: {...realWindow, width: 951, height: 1100}});
    });
    expect(observerMounts).toBe(1);
  });

  it('reads the window until the observer first reports', async () => {
    const {result} = await renderHook(() => ({sizeClass: useSizeClass(), edge: useVerticalBarEdge(), regions: useReservedRegions(), duo: useDuo()}), {wrapper: inProvider});
    expect(result.current.duo.source).toBe('window');
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'regular'});
    expect(result.current.edge).toBeNull();
    expect(result.current.regions).toEqual([]);
  });

  it('shares what the observer reports', async () => {
    const {result} = await renderHook(
      () => ({sizeClass: useSizeClass(), edge: useVerticalBarEdge(), fold: useReservedRegions({kind: 'division'}), all: useReservedRegions({includeInactive: true}), duo: useDuo()}),
      {wrapper: inProvider},
    );
    await emit(foldedPayload);
    expect(result.current.duo.source).toBe('native');
    expect(result.current.duo.window).toEqual({width: 1100, height: 951});
    expect(result.current.sizeClass).toEqual({horizontal: 'regular', vertical: 'regular'});
    expect(result.current.edge).toBe('trailing');
    expect(result.current.fold).toEqual([poses.partlyFolded.regions[0]]);
    expect(result.current.all).toHaveLength(2);
  });

  it('follows the next report, such as the fold closing', async () => {
    const {result} = await renderHook(() => ({edge: useVerticalBarEdge(), fold: useReservedRegions({kind: 'division'})}), {wrapper: inProvider});
    await emit(foldedPayload);
    await emit({sizeClass: poses.closed.sizeClass, verticalBarEdge: poses.closed.verticalBarEdge, regions: poses.closed.regions});
    expect(result.current.edge).toBe('trailing');
    expect(result.current.fold).toEqual([]);
  });

  it('re-reads the size class on every report: the app halved in a split, then shrunk by a pinned video', async () => {
    const {result} = await renderHook(() => useSizeClass(), {wrapper: inProvider});
    await emit(foldedPayload);
    expect(result.current).toEqual({horizontal: 'regular', vertical: 'regular'});
    await emit({sizeClass: poses.splitHalfLeading.sizeClass, verticalBarEdge: 'leading', regions: []});
    expect(result.current).toEqual({horizontal: 'compact', vertical: 'regular'});
    await emit({sizeClass: poses.pipPinned.sizeClass, verticalBarEdge: 'trailing', regions: poses.pipPinned.regions});
    expect(result.current).toEqual({horizontal: 'regular', vertical: 'compact'});
  });

  it('ignores a malformed report, keeps the last good one and says so', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const {result} = await renderHook(() => useVerticalBarEdge(), {wrapper: inProvider});
    await emit(foldedPayload);
    await emit({sizeClass: 'big'});
    expect(result.current).toBe('trailing');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('malformed onDuoChange payload'));
    warn.mockRestore();
  });

  it('places an Arrangement around the fold the observer reports', async () => {
    await render(
      <DuoProvider>
        <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />
      </DuoProvider>,
    );
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_PRIMARY_TESTID).props.style)).toMatchObject({left: 0, width: 1100, zIndex: 1});
    await emit(foldedPayload);
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_PRIMARY_TESTID).props.style)).toMatchObject({left: 570, top: 0, width: 530, height: 951});
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_SECONDARY_TESTID).props.style)).toMatchObject({left: 0, top: 0, width: 530, height: 951});
  });
});

describe('Arrangement inside DuoProvider', () => {
  const measureLayout = (View as unknown as {prototype: {measureLayout: jest.Mock}}).prototype.measureLayout;

  function layOutArrangement() {
    return act(async () => {
      screen.getByTestId('duo-arrangement').props.onLayout({nativeEvent: {layout: {x: 0, y: 0, width: 400, height: 300}}});
    });
  }

  beforeEach(() => {
    measureLayout.mockReset();
  });

  it('measures itself against the root view once it has a size', async () => {
    await render(
      <DuoProvider>
        <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />
      </DuoProvider>,
    );
    await layOutArrangement();
    expect(measureLayout).toHaveBeenCalledTimes(1);
  });

  it('puts the fold where it falls inside it, not inside the root', async () => {
    await render(
      <DuoProvider>
        <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />
      </DuoProvider>,
    );
    await emit(foldedPayload);
    await layOutArrangement();
    await act(async () => {
      measureLayout.mock.calls[0][1](500, 100);
    });
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_SECONDARY_TESTID).props.style)).toMatchObject({left: 0, width: 30, height: 300});
    expect(StyleSheet.flatten(screen.getByTestId(ARRANGEMENT_PRIMARY_TESTID).props.style)).toMatchObject({left: 70, width: 330, height: 300});
  });

  it('says so when it cannot measure itself', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await render(
      <DuoProvider>
        <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />
      </DuoProvider>,
    );
    await layOutArrangement();
    measureLayout.mock.calls[0][2]();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('could not measure'));
    warn.mockRestore();
  });
});
