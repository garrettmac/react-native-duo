/**
 * Apple's arrangement view in JS: two views placed around an active division. Both stay mounted in every pose so
 * folding and unfolding keep their state. Keep navigation outside an arrangement, and do not put one inside a
 * scroll view or a list.
 */
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import type { Axis, ArrangementKind } from './types';
export declare const ARRANGEMENT_TESTID = "duo-arrangement";
export declare const ARRANGEMENT_PRIMARY_TESTID = "duo-arrangement-primary";
export declare const ARRANGEMENT_SECONDARY_TESTID = "duo-arrangement-secondary";
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
export declare function Arrangement({ kind, axes, collapsed, primary, secondary, style, testID }: ArrangementProps): import("react").JSX.Element;
