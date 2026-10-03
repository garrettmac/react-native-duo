/**
 * Shows the app as it would draw in a chosen pose: the pose's window, scaled to fit the real one, under
 * `DuoTestProvider`. "Live" renders the real device's pose instead. Works in Expo Go and on the web.
 */
import {DuoTestProvider, poses, type PoseName} from '@garrettmacmac/react-native-duo/testing';
import {useState, type ReactNode} from 'react';
import {StyleSheet, View, type LayoutChangeEvent} from 'react-native';

import {Radii, useColors} from './theme';

export type SimulatedPose = PoseName | 'live';

export function Simulator({pose, children}: {pose: SimulatedPose; children: ReactNode}) {
  const colors = useColors();
  const [room, setRoom] = useState<{width: number; height: number} | null>(null);
  const measure = (event: LayoutChangeEvent) => setRoom(event.nativeEvent.layout);
  if (pose === 'live') {
    return (
      <View style={styles.fill} onLayout={measure}>
        {children}
      </View>
    );
  }

  const {window} = poses[pose];
  const scale = room ? Math.min(room.width / window.width, room.height / window.height) : 0;
  return (
    <View style={[styles.fill, styles.center]} onLayout={measure}>
      {room ? (
        <View style={{width: window.width * scale, height: window.height * scale}}>
          <View
            style={[
              styles.device,
              {width: window.width, height: window.height, borderColor: colors.border, backgroundColor: colors.background},
              {transform: [{translateX: (window.width * (scale - 1)) / 2}, {translateY: (window.height * (scale - 1)) / 2}, {scale}]},
            ]}>
            <DuoTestProvider pose={pose}>{children}</DuoTestProvider>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  center: {alignItems: 'center', justifyContent: 'center'},
  device: {overflow: 'hidden', borderWidth: 2, borderRadius: Radii.lg},
});
