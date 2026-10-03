/** The size a container laid out at, where it sits in the provider's root view (which region frames are in), and how to place a frame back in it. */
import {useCallback, useRef, useState, type RefObject} from 'react';
import {I18nManager, type LayoutChangeEvent, type ViewStyle} from 'react-native';

import {useDuoContext, type ViewRef} from './context';
import type {Rect, WindowSize} from './types';

/** A frame in physical points as an absolute style; React Native reads `right` as the left edge when it swaps sides in a right-to-left layout. */
export function placedFrame(frame: Rect): ViewStyle {
  const swapped = I18nManager.isRTL && I18nManager.getConstants().doLeftAndRightSwapInRTL;
  const horizontal = swapped ? {right: frame.x} : {left: frame.x};
  return {position: 'absolute', ...horizontal, top: frame.y, width: frame.width, height: frame.height};
}

let warned = false;

function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn('react-native-duo: could not measure a view against the DuoProvider root (is it in a separate native modal?); regions are not applied to it');
}

export interface ArrangementBox {
  ref: RefObject<ViewRef | null>;
  onLayout: (event: LayoutChangeEvent) => void;
  size: WindowSize | null;
  origin: {x: number; y: number};
}

export function useArrangementBox(): ArrangementBox {
  const {rootRef} = useDuoContext();
  const ref = useRef<ViewRef>(null);
  const [size, setSize] = useState<WindowSize | null>(null);
  const [origin, setOrigin] = useState({x: 0, y: 0});

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const {width, height} = event.nativeEvent.layout;
      setSize(previous => (previous && previous.width === width && previous.height === height ? previous : {width, height}));
      const root = rootRef?.current;
      if (!root) return;
      ref.current?.measureLayout(
        root,
        (x, y) => setOrigin(previous => (previous.x === x && previous.y === y ? previous : {x, y})),
        warnOnce,
      );
    },
    [rootRef],
  );

  return {ref, onLayout, size, origin};
}
