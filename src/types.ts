/** The shapes the native observer emits and every hook reads. Frames and margins are in the root view's points. */

export type SizeClassValue = 'compact' | 'regular';

export interface SizeClass {
  horizontal: SizeClassValue;
  vertical: SizeClassValue;
}

export type VerticalBarEdge = 'leading' | 'trailing' | null;

export type ReservedRegionKind = 'division' | 'occlusion';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Insets {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface ReservedRegion {
  kind: ReservedRegionKind;
  frame: Rect;
  margins: Insets;
  isActive: boolean;
}

export interface DuoSnapshot {
  sizeClass: SizeClass;
  verticalBarEdge: VerticalBarEdge;
  regions: ReservedRegion[];
}

export interface WindowSize {
  width: number;
  height: number;
}

export type DuoSource = 'native' | 'window';

export interface DuoState extends DuoSnapshot {
  window: WindowSize;
  source: DuoSource;
}

export type Axis = 'horizontal' | 'vertical';

export type ArrangementKind = 'overlay' | 'split';

export type CameraPosition = 'front' | 'back' | 'unspecified';

/** One camera, as `AVCaptureDeviceDescriptor` identifies it. `uniqueID` is the id camera libraries take. */
export interface CameraDescriptor {
  uniqueID: string;
  localizedName: string;
  deviceType: string;
  /** Where the camera sits on the device; not the way it faces. */
  position: CameraPosition;
}

export interface CameraDirections {
  /** Cameras facing the same way as the display the app is on: the ones to use for a selfie. */
  forward: CameraDescriptor[];
  /** Cameras facing away from the person looking at the app. */
  backward: CameraDescriptor[];
  /** `native` once iOS has reported; `unavailable` where there is no direction coordinator (before iOS 27.1, Android, Expo Go, web, jest). */
  source: 'native' | 'unavailable';
}
