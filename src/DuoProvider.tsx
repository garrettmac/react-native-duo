/**
 * Mounts the native observer once, filling the root, and shares what it reports. Without the native view it shares
 * the window size, no regions and a null edge, and says so through `useDuo().source`.
 */
import {useCallback, useMemo, useRef, useState, type ReactNode} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';

import {DuoContext, NO_CAMERAS, windowState, type DuoContextValue, type ViewRef} from './context';
import {loadObserverView} from './native';
import {parseCameraDirections, parseSnapshot} from './snapshot';
import type {CameraDirections, DuoSnapshot} from './types';

export function DuoProvider({children}: {children: ReactNode}) {
  const {width, height} = useWindowDimensions();
  const rootRef = useRef<ViewRef>(null);
  const [ObserverView] = useState(loadObserverView);
  const [snapshot, setSnapshot] = useState<DuoSnapshot | null>(null);
  const [cameras, setCameras] = useState<CameraDirections>(NO_CAMERAS);
  const [cameraWatchers, setCameraWatchers] = useState(0);

  const onDuoChange = useCallback((event: {nativeEvent: unknown}) => {
    const parsed = parseSnapshot(event.nativeEvent);
    if (parsed === null) {
      console.warn('react-native-duo: ignored a malformed onDuoChange payload from the native observer');
      return;
    }
    setSnapshot(parsed);
  }, []);

  const onCameraDirections = useCallback((event: {nativeEvent: unknown}) => {
    const parsed = parseCameraDirections(event.nativeEvent);
    if (parsed === null) {
      console.warn('react-native-duo: ignored a malformed onCameraDirections payload from the native observer');
      return;
    }
    setCameras(parsed);
  }, []);

  const watchCameras = useCallback(() => {
    setCameraWatchers(count => count + 1);
    return () => setCameraWatchers(count => count - 1);
  }, []);

  const value = useMemo<DuoContextValue>(() => {
    const window = {width, height};
    const state = snapshot === null ? windowState(window) : {...snapshot, window, source: 'native' as const};
    return {state, rootRef, cameras: cameraWatchers > 0 ? cameras : NO_CAMERAS, watchCameras};
  }, [snapshot, width, height, cameras, cameraWatchers, watchCameras]);

  return (
    <DuoContext.Provider value={value}>
      <View ref={rootRef} style={styles.root}>
        {ObserverView === null ? null : (
          <ObserverView
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            observeCameras={cameraWatchers > 0}
            onDuoChange={onDuoChange}
            onCameraDirections={onCameraDirections}
          />
        )}
        {children}
      </View>
    </DuoContext.Provider>
  );
}

const styles = StyleSheet.create({root: {flex: 1}});
