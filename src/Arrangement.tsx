/**
 * Apple's arrangement view in JS: two views placed around an active division. Both stay mounted in every pose so
 * folding and unfolding keep their state. Keep navigation outside an arrangement, and do not put one inside a
 * scroll view or a list.
 */
import {useMemo, type ReactNode} from 'react';
import {I18nManager, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {arrangementLayout, type ViewState} from './arrangement-layout';
import {useDuoContext} from './context';
import {placedFrame, useArrangementBox} from './measure';
import {edgesInBox, PaneProvider, type Pane, type PaneSide} from './pane';
import type {Axis, ArrangementKind, WindowSize} from './types';

export const ARRANGEMENT_TESTID = 'duo-arrangement';
export const ARRANGEMENT_PRIMARY_TESTID = 'duo-arrangement-primary';
export const ARRANGEMENT_SECONDARY_TESTID = 'duo-arrangement-secondary';

const BOTH_AXES: readonly Axis[] = ['horizontal', 'vertical'];

export interface ArrangementProps {
  kind: ArrangementKind;
  axes?: Axis | readonly Axis[];
  primary: ReactNode;
  secondary: ReactNode;
  /** Overlay only: hide the secondary view (it stays mounted) and give the primary the whole arrangement. */
  collapsed?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function asList(axes: Axis | readonly Axis[]): readonly Axis[] {
  return typeof axes === 'string' ? [axes] : axes;
}

function paneOf({frame, isHidden, splitAxis}: ViewState, side: PaneSide, origin: {x: number; y: number}, size: WindowSize): Pane {
  const split = splitAxis !== null;
  return {split, side: split ? side : 'only', x: origin.x + frame.x, y: origin.y + frame.y, width: frame.width, height: frame.height, hidden: isHidden, edges: edgesInBox(frame, size)};
}

function placedStyle({frame, isHidden, zIndex}: ViewState): ViewStyle {
  return {...placedFrame(frame), zIndex, display: isHidden ? 'none' : 'flex'};
}

export function Arrangement({kind, axes = BOTH_AXES, collapsed = false, primary, secondary, style, testID = ARRANGEMENT_TESTID}: ArrangementProps) {
  const {state} = useDuoContext();
  const {ref, onLayout, size: box, origin} = useArrangementBox();

  const size = box ?? state.window;
  const axisList = asList(axes);
  const layout = useMemo(
    () => arrangementLayout({kind, axes: axisList, size, origin, regions: state.regions, rtl: I18nManager.isRTL, collapsed}),
    [kind, axisList, collapsed, size, origin, state.regions],
  );

  return (
    <View ref={ref} testID={testID} style={[styles.container, style]} onLayout={onLayout}>
      <PaneProvider pane={paneOf(layout.secondary, kind === 'overlay' ? 'leading' : 'trailing', origin, size)}>
        <View testID={ARRANGEMENT_SECONDARY_TESTID} style={placedStyle(layout.secondary)}>
          {secondary}
        </View>
      </PaneProvider>
      <PaneProvider pane={paneOf(layout.primary, kind === 'overlay' ? 'trailing' : 'leading', origin, size)}>
        <View testID={ARRANGEMENT_PRIMARY_TESTID} style={placedStyle(layout.primary)}>
          {primary}
        </View>
      </PaneProvider>
    </View>
  );
}

const styles = StyleSheet.create({container: {flex: 1}});
