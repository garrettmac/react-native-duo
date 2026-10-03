/** Every color, size and gap the example draws with. */
import {useColorScheme} from 'react-native';

export const Spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32} as const;
export const Radii = {sm: 8, md: 12, lg: 20, pill: 999} as const;
export const Type = {caption: 12, body: 15, title: 17, heading: 22, display: 28} as const;
export const Layout = {gutter: Spacing.lg, section: Spacing.xl, tapTarget: 44, barWidth: 64, barItem: 52, cellMin: 150, sheetMax: 560, keypadShare: 0.62, squareAspect: 1.8, sidebarFraction: 0.28, sidebarMin: 200, sidebarMax: 280, artworkShare: 0.6, thumb: 44, shutter: 72, swatch: 28, menuWidth: 200, slide: 220} as const;

/** The canvas demo's ink colors. */
export const Swatches = ['#2F6BFF', '#E5484D', '#30A46C'] as const;

const light = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  raised: '#E9ECF1',
  text: '#14171C',
  muted: '#5D6573',
  accent: '#2F6BFF',
  onAccent: '#FFFFFF',
  border: '#D5DAE1',
  fold: 'rgba(255, 64, 64, 0.28)',
  camera: 'rgba(255, 168, 0, 0.35)',
  scrim: 'rgba(10, 12, 16, 0.32)',
  map: '#CFE3D4',
  water: '#B7D4EA',
};

const dark: typeof light = {
  background: '#0E1014',
  surface: '#181B21',
  raised: '#232832',
  text: '#F2F4F7',
  muted: '#9AA3B2',
  accent: '#6E9BFF',
  onAccent: '#0E1014',
  border: '#2C323D',
  fold: 'rgba(255, 96, 96, 0.35)',
  camera: 'rgba(255, 184, 48, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.5)',
  map: '#1F3326',
  water: '#1B2D3D',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
