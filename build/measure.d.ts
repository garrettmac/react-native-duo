/** The size a container laid out at, where it sits in the provider's root view (which region frames are in), and how to place a frame back in it. */
import { type RefObject } from 'react';
import { type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { type ViewRef } from './context';
import type { Rect, WindowSize } from './types';
/** A frame in physical points as an absolute style; React Native reads `right` as the left edge when it swaps sides in a right-to-left layout. */
export declare function placedFrame(frame: Rect): ViewStyle;
export interface ArrangementBox {
    ref: RefObject<ViewRef | null>;
    onLayout: (event: LayoutChangeEvent) => void;
    size: WindowSize | null;
    origin: {
        x: number;
        y: number;
    };
}
export declare function useArrangementBox(): ArrangementBox;
