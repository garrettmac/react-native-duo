import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
export declare const DUO_NATIVE_MODULE = "ReactNativeDuo";
export declare const DUO_NATIVE_VIEW = "DuoObserverView";
export interface DuoObserverViewProps {
    style?: StyleProp<ViewStyle>;
    pointerEvents?: 'none';
    observeCameras?: boolean;
    onDuoChange: (event: {
        nativeEvent: unknown;
    }) => void;
    onCameraDirections?: (event: {
        nativeEvent: unknown;
    }) => void;
}
export declare function loadObserverView(): ComponentType<DuoObserverViewProps> | null;
