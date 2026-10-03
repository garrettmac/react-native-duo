# iPhone Duo, foldables and iPad (core rules)

This app uses `@garrettmacmac/react-native-duo`, after Apple's
[Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo).
Every screen must work on a phone, the closed and open iPhone Duo in every pose, a split view and iPad. Before writing
or changing UI, read `duo.md` beside this file (the full rules and API); `apple-guidelines.md` has Apple's reasons.

1. Decide one pane or two with `useSizeClass()` or `useSplitWindow()`, never a width, a breakpoint, `Platform.isPad`,
   the orientation or the device.
2. Size to `usePane()`, never `Dimensions`, `useWindowDimensions()` or the screen; never cache a size at mount.
3. Same hierarchy, controls and state in every pose; small moves, never a different app when it unfolds.
4. Two layers share the window through `<PaneLayout arrangement="sheet" | "list-detail" | "side-by-side">`, inside the
   navigator. Leading is where you are, trailing what you picked; both stay mounted.
5. Tappable controls stay out of the fold and the cameras (`<AvoidReservedRegions>`, `useFold()`); scrolling content
   may pass under the fold.
6. Grids use `useEvenColumns()`: 1, 2 or 4 columns, never 3.
7. A screen's top and bottom bars go through `<DuoPage topBar bottomBar>`, which stands them in the side strip where
   the system does; items through `<DuoBar>`; a list's detail stacks in `<DetailStack>`. A bar drawn without them
   follows `useVerticalBarEdge()` and `useVerticalBar()`: Back or Close on top, then the prominent action; every item
   has a symbol and a title; one overflow menu.
8. Content insets from the bar (`useBarInsets()`); only immersive, non-scrolling screens center on the full display.
9. Custom sheets follow `useSheetPose()`; cameras are picked and mirrored by `useCameraDirections()`, never position.
10. Test every screen under `DuoTestProvider` for each of `POSE_NAMES` (`@garrettmacmac/react-native-duo/testing`).
