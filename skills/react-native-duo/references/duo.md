# iPhone Duo, foldables and iPad: rules for coding agents

This app uses `@garrettmacmac/react-native-duo`. Follow these rules for every screen you write or change, not only screens
that look "foldable". They come from Apple's [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo),
[Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo),
the tech talks [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466/) and
[Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/), and the package's API.
A summary of Apple's guidance, with the source of each line, is in
`apple-guidelines.md` beside this file.

## What the device does

- **Two displays.** Closed, the outer display is compact width, wider and shorter than an iPhone. Open, the inner display
  is regular width. The same app moves between them as the person opens and closes it, and must keep its state.
- **Poses.** Open flat, partly folded like a book (the fold divides the display left and right), partly folded like a
  laptop on a table (top and bottom), standing on its edges, and rotated. A 50/50 split view puts the app in half the
  inner display (compact width), and a pinned picture-in-picture video shrinks the app's height live.
- **Bars on the side.** On the outer display, and on the inner display in landscape, the system moves toolbars, the tab
  bar and Back to a vertical strip on one edge, shared with the status bar and the Dynamic Island. In a split view each
  app's bars sit on its outer edge. Only the inner display in portrait keeps horizontal bars.
- **Reserved regions.** The outer camera (always), the inner camera (only while it is on) and the fold (only while
  partly folded). Each has a frame and margins that tappable content keeps clear of.

## The rules

1. **Size classes, never widths or devices.** Decide one pane or two with `useSizeClass()` (or `useSplitWindow()`),
   never a width, a breakpoint, `Platform.isPad`, the orientation or the device model. Compact width is the outer
   display and phones; regular is the inner display and iPad. The class is the app's window, not the screen.
2. **Size to the pane, never the window or the screen.** Read `usePane()` for your width and height. Do not read
   `Dimensions.get('screen')`, and do not read `useWindowDimensions()` or `Dimensions.get('window')` in a component
   that can sit in one half of a split. Never cache a size at mount: the window changes while the app runs.
3. **Don't reinvent the app when it resizes.** Keep the same hierarchy, the same controls and the same state on both
   displays and in every pose. Favor small moves over rearrangement; move only what must move to stay visible and
   tappable. The inner display may show one more level of hierarchy (a list and its detail side by side), never a
   different app.
4. **Two layers share the window through one container.** Wrap the screen's content, inside its navigator, in
   `PaneLayout`:
   - a list or sheet over a map: `<PaneLayout arrangement="sheet" leading={<Map/>} trailing={<Sheet/>} />`
   - a list whose rows open a detail: `<PaneLayout arrangement="list-detail" leading={<List/>} trailing={<Detail/>} compact={selected ? 'trailing' : 'leading'} />`
   - two contents at once (a day and its map): `<PaneLayout arrangement="side-by-side" leading={<Day/>} trailing={<DayMap/>} />`

   Leading is where you are, trailing is what you picked; detail never goes leading. Both panes stay mounted in every
   pose, so do not key them on the size class and do not unmount one to "hide" it. Apple's exact
   `UIArrangementViewController` (`primary` and `secondary`, `axes`, `collapsed`) is `Arrangement` from
   `@garrettmacmac/react-native-duo/layout`, for the rare screen `PaneLayout` does not fit.
5. **Navigation wraps the container, never sits inside it.** Tabs and stacks go around `PaneLayout` or
   `Arrangement`. Never put either inside a `ScrollView`, `FlatList` or another split.
6. **A page with one layer does nothing special.** It stays one column; `usePane()` returns the window.
7. **Keep tappable controls out of reserved regions.** Wrap buttons, toggles and chips that could land on the fold in
   `<AvoidReservedRegions>` (in fixed bars and layouts; it measures on layout, so not inside a scroll view), or place
   them yourself from `useFold()`. Never guess the fold from the
   window's midpoint. Scrolling content may pass under the fold. Partly folded like a laptop, tappable controls belong
   on the bottom half: when `useFold()` is set, give what you look at one side and what you touch the other (a
   `PaneLayout arrangement="side-by-side"`), the way Calculator, Music and Photos do.
8. **Even grids.** Columns come from `useEvenColumns(minCellWidth, {gap, inset})`: 1 when only one fits, otherwise 2
   or 4, never odd, so the fold falls between columns.
9. **A screen's bars go through `DuoPage`.** Pass the top bar and the bottom bar once:
   `<DuoPage topBar={...} bottomBar={...}>`. On a phone, an iPad and the inner display in portrait it is a plain column.
   Where the system stands bars on the side it moves both into one strip on that edge, under the camera; a `DuoPage`
   in a pane against that edge gives its bars to the same strip, and one in a pane away from it keeps them across the
   top of its pane. Draw a bar as a function of `{vertical, edge}` or pass `sideTopBar`/`sideBottomBar`; when
   `usePage().vertical`, draw the title in the content. Use `shareSide={false}` for a pane whose bar holds a text field,
   `mode="horizontal"` for a player whose controls never move, `renderSide` to draw the strip yourself.
   - Bar items: `<DuoBar items renderItem>` lays them out by the rules below; give a navigation bar and a toolbar the
     same `items` with `part="top"` and `part="bottom"`, and a `renderOverflow` for the More menu.
   - Deeper in a list's detail: wrap the trailing pane in `<DetailStack key={selected} onExit>` and `push` from
     `useDetailStack()`; draw Back when its `showBack` is true. Every screen in the stack stays mounted.
10. **Custom bars follow the system's edge.** If the app draws its own header, toolbar or tab bar without `DuoPage`,
   read `useVerticalBarEdge()`. When it is `'leading'` or `'trailing'`, stand the bar vertical on that edge and lay
   items out with `useVerticalBar(items, {itemLength, insetTop})`:
   - top of the strip: Back or Close (`role: 'navigation'`), then the prominent action (`role: 'prominent'`, Done,
     Share, Compose), then the top bar's items; the bottom toolbar's items (`bar: 'bottom'`) at the bottom; a tab bar
     stays bottom-aligned;
   - never claim the top of the strip (`insetTop`): the status bar and the Dynamic Island live there and grow;
   - every item has a symbol (`icon: true`) and a `title`; a text-only button or a segmented control
     (`axisBehavior: 'horizontalOnly'`) stays in a horizontal bar at the top of the screen;
   - what does not fit goes to one overflow menu (draw symbol and title); the ellipsis means overflow and nothing else;
     set `priority` so frequent actions and items with badges stay longest;
   - on a navigation screen bar items overflow first (`compression: 'prefersTabBar'`, the default); on a task screen
     (checkout, compose) the tab bar minimizes first (`'prefersBarItems'`);
   - controls that act on one pane stay with that pane rather than moving to the strip.

   With `null`, bars stay horizontal. Only truly native bars move on their own: Expo Router's `NativeTabs` and the
   native stack's header items. React Navigation's JS bottom tabs, JS stack headers and any header you draw are custom
   bars and follow this rule.
11. **Inset content from the bar; only the immersive centers.** Pad scrolling content by `useBarInsets(barWidth)`
    (`leading` and `trailing`, as `paddingStart`/`paddingEnd`), handling each side on its own: insets are asymmetric.
    A full-bleed background or header may run under the bar. A screen that is immersive, highly visual and does not
    scroll (a camera, a pass, a photo viewer, a calculator) may center on the whole display as long as nothing
    tappable lands under the bar or a camera: clear the cameras with `useCameraClearance()` and `clearancePadding()`.
12. **Sheets follow the pose.** A custom sheet reads `useSheetPose({placement, verticalBarBehavior})`: the whole width
    on a compact window with its controls standing on the bar edge; centered on a regular window by default (or
    `'leading'`/`'trailing'`); always beside an active fold, never across it. Set `verticalBarBehavior: 'disabled'` for
    a sheet with a single action; its horizontal row then stops short of the outer camera (`rowSidePadding()` from `/layout`).
13. **Cameras by direction, not position.** On iPhone Duo a front camera can face away and a back camera can face the
    person as the device opens and closes. Pick the camera to show the person with `forwardCamera(useCameraDirections())`
    and mirror with `shouldMirror()`; never mirror because `position === 'front'`. Keep a code path for
    `source === 'unavailable'` (older iOS, Android, Expo Go).
14. **Games and full-screen media fill every pose.** Prefer changing the aspect ratio to letterboxing; keep text and
    control sizes steady when resizing.

## Check every screen in every pose

Render the screen under `DuoTestProvider` for each name in `POSE_NAMES` (`phone`, `iPad`, `closed`, `closedLandscape`, `openPortrait`,
`openLandscape`, `partlyFolded`, `partlyFoldedTabletop`, `splitHalfLeading`, `splitHalfTrailing`, `pipPinned`) and
assert what changes: the panes, the bar's edge, that every control is still reachable.

```tsx
import {DuoTestProvider, POSE_NAMES} from '@garrettmacmac/react-native-duo/testing';

it.each(POSE_NAMES)('works in %s', async pose => {
  await render(<DuoTestProvider pose={pose}><Screen /></DuoTestProvider>);
  expect(screen.getByRole('button', {name: 'Done'})).toBeOnTheScreen();
});
```

On a Mac, run the app on the iPhone Duo simulator in Xcode 27.1's Device Hub and open, close, rotate and fold it.

## Before you finish a change, confirm

- No `Dimensions`, `useWindowDimensions`, `Platform.isPad` or hard-coded width decides a layout.
- Any screen with two layers composes `PaneLayout` or `Arrangement`, inside its navigator.
- Every tappable control is clear of the fold and the cameras, and every bar item has a symbol and a title.
- The screen keeps its state when the pose changes, and was rendered in every pose.

## API at a glance

| Need | Use |
| --- | --- |
| Mount once at the root | `<DuoProvider>` |
| One pane or two | `useSizeClass()`, `useSplitWindow()` |
| My size | `usePane()` |
| Two layers or contents | `<PaneLayout>` |
| The fold | `useFold()`, `<AvoidReservedRegions>` |
| Cameras as regions | `useReservedRegions({kind: 'occlusion'})`, `useCameraClearance()` |
| A screen's bars | `<DuoPage>`, `usePage()`, `<DuoBar>`, `barGroups()` |
| Deeper in a detail pane | `<DetailStack>`, `useDetailStack()` |
| Bars you draw yourself | `useVerticalBarEdge()`, `useVerticalBar()`, `useBarInsets()` |
| Sheets | `useSheetPose()` |
| Grids | `useEvenColumns()` |
| Which camera faces the person | `useCameraDirections()`, `forwardCamera()`, `shouldMirror()` |
| Tests | `<DuoTestProvider pose>`, `POSE_NAMES` from `@garrettmacmac/react-native-duo/testing` |
