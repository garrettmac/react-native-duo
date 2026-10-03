# Changelog

## Unreleased

- `DetailStack` can follow your own state: `screens` (the screens above the first) with `onBack`, `onPush` and
  `onPopToRoot`. It draws them and marks the ones under the top as hidden panes, and `push`, `back` and `popToRoot`
  ask you instead of keeping a stack of their own.
- `usePane()` has `edges`: the edges of its `PaneLayout` (or `Arrangement`), or of the window, the pane reaches, named
  as a style names them. `PaneProvider` takes a pane without `edges` and reads them from where it sits.
- A `PaneLayout` in a hidden pane hides both of its panes. It used to show them, so a page inside one kept hosting its
  bars in the side strip from a blurred tab or a covered screen.
- `PaneLayout` decides an automatic split from its own box: `minSplitWidth` (default 600) is the narrowest box that
  splits without a fold. A list and its detail in a page sheet on an iPad used to split into halves narrower than a phone.
- `PaneLayout` `dock` puts a `sheet` beside its map in halves on a regular box, portrait included.
- A list and its detail at half the width split in the same halves as any split without a fold (the odd point on
  the physical left in right to left too).

- `DuoPage` keeps its content mounted when the pose moves its bars (between a column, its own strip and the
  strip around it). It used to remount the content, so a half-typed message or any other state was lost when the
  iPhone Duo was opened, closed or turned.
- A `DuoPage` with `shareSide={false}` inside another page's strip always keeps its bars in its own pane. It used to
  stand them for a frame after a pose change, while its frame was stale, which remounted a composer in its bottom bar.
- `DuoOverlay` and `DuoOverlayHost` draw a custom sheet above the page. Mounted inside `DuoPage`, a sheet's
  controls standing on the bar edge were covered by the side strip.
- `useSheetPose` returns `columnInsetTop`, so the closed iPhone Duo's standing controls start below the camera
  over their column (new options `columnWidth` and `columnPadding`); `columnInsetTop()` is the math, from `/layout`.
- `SheetPlacement` has `y`, the panel's top edge (null for a card sheet), as the README already showed.

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
- React Native 0.88, where `View` is a function component: `ArrangementBox.ref` is a
  `RefObject<ComponentRef<typeof View> | null>`, which is the `View` instance on earlier versions.
- Cameras: `useCameraDirections`, `forwardCamera`, `shouldMirror` (iOS 27.1's `AVCaptureDeviceDirectionCoordinator`).
- Tests: `DuoTestProvider` and eleven poses (closed landscape included) from `@garrettmacmac/react-native-duo/testing`.
- Agents: rules in `rules/` (core, full, Apple's guidance), a Claude Code skill and plugin, and
  `npx @garrettmacmac/react-native-duo agents` for CLAUDE.md, AGENTS.md and Cursor.
- Example: every API in an Expo app, ten advanced cases, and README pictures of each on a normal iPhone, the closed
  and open iPhone Duo and the open one rotated.
