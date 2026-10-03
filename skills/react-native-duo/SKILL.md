---
name: react-native-duo
description: iPhone Duo, foldable, iPad and split view layout rules for React Native and Expo apps using @garrettmacmac/react-native-duo. Use when writing or changing any screen, layout, navigator, tab bar, toolbar, header, sheet, modal, grid, list-detail, map overlay or camera view, or when asked about iPhone Duo, folding phones, the fold, hinge, reserved regions, size classes, vertical bars or iPad layouts.
---

# iPhone Duo layouts with @garrettmacmac/react-native-duo

Every screen in this app must work on a phone, the closed and open iPhone Duo in every pose, a split view and iPad.

1. Read `references/duo.md` before writing UI. It holds the rules, the API for each, and the checks.
2. When a rule's reason matters (a reviewer asks why, or two rules pull apart), read
   `references/apple-guidelines.md`: Apple's guidance with sources.
3. Build the screen from the package's blocks: `PaneLayout` for two layers, `usePane()` for size, `useSizeClass()` for
   one pane or two, `AvoidReservedRegions` around tappable controls near the fold, `useVerticalBar()` for custom bars,
   `useSheetPose()` for custom sheets, `useEvenColumns()` for grids, `useCameraDirections()` for cameras.
4. Test the screen under `DuoTestProvider` (from `@garrettmacmac/react-native-duo/testing`) in every pose in `POSE_NAMES`.
5. Before finishing, run the checklist at the end of `references/duo.md`.

If the project has no `DuoProvider` at its root, add it around the root navigator first.
