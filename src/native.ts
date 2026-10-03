/**
 * The native observer view, when this binary has it. `DuoProvider` resolves it once per mount. Expo Go, jest, web and a build made before the module was
 * added have no view; `DuoObserverView` is then null and the provider reads the window instead.
 */
import {requireNativeView, requireOptionalNativeModule} from 'expo';
import type {ComponentType} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export const DUO_NATIVE_MODULE = 'ReactNativeDuo';
export const DUO_NATIVE_VIEW = 'DuoObserverView';

export interface DuoObserverViewProps {
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'none';
  observeCameras?: boolean;
  onDuoChange: (event: {nativeEvent: unknown}) => void;
  onCameraDirections?: (event: {nativeEvent: unknown}) => void;
}

export function loadObserverView(): ComponentType<DuoObserverViewProps> | null {
  if (requireOptionalNativeModule(DUO_NATIVE_MODULE) === null) return null;
  try {
    return requireNativeView<DuoObserverViewProps>(DUO_NATIVE_MODULE, DUO_NATIVE_VIEW);
  } catch {
    return null;
  }
}
