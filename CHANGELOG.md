# Changelog

## 0.1.0-beta.0

First release, a beta until the native code has run on an iPhone Duo.

- `DuoProvider` with a native observer on iOS (size classes, the `verticalBarEdge` trait, reserved regions) and
  Android (Jetpack WindowManager folds), and a window fallback everywhere else.
- Layout: `PaneLayout` (`sheet`, `list-detail`, `side-by-side`), `usePane`, `useSplitWindow`, `useEvenColumns`;
  `Arrangement` (Apple's arrangement view, with `axes` and `collapsed`) and the layout math from
  `@garrettmacmac/react-native-duo/layout`.
- The fold and cameras: `useReservedRegions`, `useFold`, `AvoidReservedRegions`, `avoidanceOffset`,
  `useCameraClearance`.
- Bars: `DuoPage` (a screen's top and bottom bars, standing in one side strip per edge where the system puts bars
  there, with `sideTopBar`, `sideBottomBar`, `renderSide`, `mode`, `shareSide` and a style for every part) and
  `usePage`; `DuoBar` (bar items by Apple's rules, every part drawn by you, `part` to split one list across a
  navigation bar and a toolbar); `barGroups` and item `group`s for capsules; `useVerticalBarEdge`, `useBarInsets`,
  `useVerticalBar`.
- A list's detail: `DetailStack` and `useDetailStack` (push, back, `popToRoot`, `showBack`, `renderStack`), and
  `PaneLayout`'s sidebar width (`leadingFraction`, `minLeadingWidth`, `maxLeadingWidth`), `split` and pane styles.
- Sheets: `useSheetPose`.
- Cameras: `useCameraDirections`, `forwardCamera`, `shouldMirror` (iOS 27.1's `AVCaptureDeviceDirectionCoordinator`).
- Tests: `DuoTestProvider` and eleven poses (closed landscape included) from `@garrettmacmac/react-native-duo/testing`.
- Agents: rules in `rules/` (core, full, Apple's guidance), a Claude Code skill and plugin, and
  `npx @garrettmacmac/react-native-duo agents` for CLAUDE.md, AGENTS.md and Cursor.
- Example: every API in an Expo app, ten advanced cases, and README pictures of each on a normal iPhone, the closed
  and open iPhone Duo and the open one rotated.
