/** What every advanced case is given, and the pieces they share. */
import {useCameraClearance} from '@garrettmacmac/react-native-duo';
import {StyleSheet} from 'react-native';

import type {Action} from '../bars';
import {Layout, Spacing} from '../theme';

export interface CaseProps {
  onClose: () => void;
  /** The status bar's height on a real device; zero in a simulated pose. */
  insetTop: number;
  params: URLSearchParams;
}

export function closeAction(onClose: () => void): Action {
  return {key: 'close', glyph: '✕', title: 'Close', icon: true, role: 'navigation', onPress: onClose};
}

/** The strip's free room at its top: the status bar or the camera, whichever is taller. */
export function useSideInsetTop(insetTop: number): number {
  return Math.max(insetTop, useCameraClearance().top);
}

export const shared = StyleSheet.create({
  fill: {flex: 1},
  strip: {width: Layout.barWidth, gap: Spacing.sm, paddingBottom: Spacing.lg, borderStartWidth: StyleSheet.hairlineWidth},
  navBar: {minHeight: Layout.tapTarget + Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth},
  toolbar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth},
  content: {padding: Layout.gutter, gap: Spacing.md},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Layout.gutter},
});
