/**
 * Renders children as if the app were in one pose, with no native view: for jest, screenshots and in-app previews.
 * Like `DuoProvider` it wraps children in a root view, so region frames are measured from it.
 */
import {useMemo, useRef, type ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {DuoContext, fixedContext, type DuoContextValue, type ViewRef} from './context';
import {poses, type Pose, type PoseName} from './poses';
import type {CameraDirections} from './types';

export interface DuoTestProviderProps {
  pose: PoseName | Pose;
  /** What `useCameraDirections()` reports; nothing by default. */
  cameras?: CameraDirections;
  children: ReactNode;
}

export function DuoTestProvider({pose, cameras, children}: DuoTestProviderProps) {
  const rootRef = useRef<ViewRef>(null);
  const resolved = typeof pose === 'string' ? poses[pose] : pose;
  const value = useMemo<DuoContextValue>(
    () => ({
      ...fixedContext(
        {
          sizeClass: resolved.sizeClass,
          verticalBarEdge: resolved.verticalBarEdge,
          regions: resolved.regions,
          window: resolved.window,
          source: 'native',
        },
        cameras,
      ),
      rootRef,
    }),
    [resolved, cameras],
  );
  return (
    <DuoContext.Provider value={value}>
      <View ref={rootRef} style={styles.root}>
        {children}
      </View>
    </DuoContext.Provider>
  );
}

const styles = StyleSheet.create({root: {flex: 1}});
