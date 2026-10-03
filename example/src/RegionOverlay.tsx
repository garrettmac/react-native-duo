/** Draws every reserved region where the app sits: the fold in red, the cameras in amber, dashed while inactive. */
import {useReservedRegions} from '@garrettmacmac/react-native-duo';
import {placedFrame} from '@garrettmacmac/react-native-duo/layout';
import {StyleSheet, View} from 'react-native';

import {useColors} from './theme';

export function RegionOverlay() {
  const colors = useColors();
  const regions = useReservedRegions({includeInactive: true});
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {regions.map((region, index) => (
        <View
          key={index}
          style={[
            placedFrame(region.frame),
            styles.region,
            {
              backgroundColor: region.isActive ? (region.kind === 'division' ? colors.fold : colors.camera) : 'transparent',
              borderColor: region.kind === 'division' ? colors.fold : colors.camera,
              borderStyle: region.isActive ? 'solid' : 'dashed',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({region: {borderWidth: 2}});
