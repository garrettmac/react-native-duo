# @garrettmacmac/react-native-duo

Make a React Native or Expo app feel at home on **iPhone Duo**, Android foldables and iPad: size classes, the fold and
the cameras as reserved regions, bars that stand on the side, sheets and panes that follow the pose, cameras picked by
the way they face, and test poses for every way the device is held.

It follows Apple's **[Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)**
guidelines, [Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo),
and the tech talks [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466/) and
[Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/). It also ships those rules
for coding agents, so Claude Code, Codex, Cursor and other agents build Duo-ready screens in your app
([Agents](#agents)).

<p>
  <img alt="Closed: bars on the side, content clear of the camera" src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-closed-m2.png" width="32%" />
  <img alt="Partly folded: map and list either side of the fold" src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-partlyFolded.png" width="32%" />
  <img alt="Open: Mail-style list and message side by side" src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-openLandscape.png" width="32%" />
</p>

## Install

```sh
npx expo install @garrettmacmac/react-native-duo
```

Rebuild the native app (`npx expo run:ios`, `npx expo run:android`, or an EAS build). In Expo Go, on the web and in
jest the package still works: it reads the window, reports no regions and no bar edge, and says so in
`useDuo().source`.

Then give your coding agents the rules (optional, recommended):

```sh
npx @garrettmacmac/react-native-duo agents
```

> **Beta.** The JavaScript is tested in every pose; the native code has not yet run on an iPhone Duo. See
> [Status](#how-it-works).

## Use

Every component below renders **exactly what you pass, where you would put it, on a normal iPhone**. It only moves
things on the iPhone Duo, a split view, a foldable or an iPad, and every part takes a style or a render function of
your own.

Each case shows the same example screen on a normal iPhone, the closed iPhone Duo and the open iPhone Duo. The pictures
come from the [example app](#example-app) (`?demo=…&pose=…` on the web). Red dashes are the fold, amber the cameras.

### 1. Mount the provider once

```tsx
import {DuoProvider} from '@garrettmacmac/react-native-duo';

export default function RootLayout() {
  return (
    <DuoProvider>
      <Stack />
    </DuoProvider>
  );
}
```

### 2. Bars: `DuoPage`

Pass a screen's top bar and bottom bar once. On a phone they sit on top and at the bottom. Where the system stands
bars on the side (the closed iPhone Duo, the open one in landscape, half the display in Split View) both move into one
strip on that edge, under the camera and the status bar: the top bar's controls at the top, the bottom bar's at the
bottom. There is no room for a title in the strip, so draw it in the content when `usePage().vertical` is true.

```tsx
<DuoPage
  topBar={({vertical}) => <MessageBar vertical={vertical} />} // a function of where it is drawn, or a plain element
  bottomBar={<TabBar />}
  sideBottomBar={<SideTabs />}                                   // optional: your own component for the strip
  sideStyle={{width: 64, gap: 8}}                                // optional: the strip
>
  <Message />
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-phone-m2.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-closed-m2.png" width="240"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-openLandscape-m2.png" width="420"> |

Pages nest. A `DuoPage` in the pane against the strip gives its bars to that strip, so a window has one strip, as in
Apple's Mail. A page in a pane away from the edge keeps its bars across the top of its pane.

| Prop | What it does |
| --- | --- |
| `topBar`, `bottomBar` | An element, or `(placement) => element` with `{position: 'top' \| 'bottom' \| 'side', vertical, edge}` |
| `sideTopBar`, `sideBottomBar` | Drawn in the strip instead of the top or bottom bar |
| `style`, `contentStyle`, `sideStyle` | The page, the content and the strip |
| `topBarStyle`, `bottomBarStyle` | Wrap the bars on a phone (no wrapper unless given) |
| `sideInsetTop`, `sideInsetBottom` | Room the strip keeps free; defaults to the camera's clearance |
| `renderSide` | Draw the whole strip yourself from `{edge, top, bottom, insetTop, insetBottom}` |
| `mode` | `auto` (default), `horizontal` or `side` |
| `shareSide` | `false` keeps a nested page's bars in its own pane |
| `onModeChange` | Told when the bars move |

`usePage()` returns `{mode: 'horizontal' | 'side' | 'hosted', vertical, edge}` for anything inside.

### 3. Bar items: `DuoBar`, `useVerticalBar`, `barGroups`

`DuoBar` lays out bar items by Apple's rules and draws each part with your components: Back or Close first, then the
prominent action, then the rest; bottom-toolbar items at the bottom of the strip; items that share a `group` in one
capsule; what does not fit in one More menu. Horizontal on a phone, standing in the strip.

```tsx
<DuoBar
  items={[
    {key: 'back', role: 'navigation', icon: true, title: 'Back'},
    {key: 'reply', icon: true, title: 'Reply', group: 'respond'},
    {key: 'forward', icon: true, title: 'Forward', group: 'respond'},
    {key: 'trash', icon: true, title: 'Delete', bar: 'bottom'},
  ]}
  renderItem={(item, {vertical}) => <IconButton name={item.key} label={vertical ? undefined : item.title} />}
  renderGroup={(children, items, {vertical}) => <Capsule vertical={vertical}>{children}</Capsule>}  // optional
  renderOverflow={items => <MoreMenu items={items} />}                                                // optional
  part="top"                                                                                           // optional: see below
  title={<Text>Inbox</Text>}                                                                           // horizontal only
  style={styles.bar} horizontalStyle={styles.navBar} verticalStyle={styles.strip}                    // optional
/>
```

`useVerticalBar(items, options)` is the same layout with no drawing at all: `{axis, edge, top, bottom, horizontal,
overflow, tabBar}`. `barGroups(items)` splits a run into capsules. When the strip runs out of room, `compression`
picks Apple's way: `prefersTabBar` folds the toolbar into More and keeps the tab bar; `prefersBarItems` keeps the
toolbar and shrinks the tab bar to one button (the **Bars** demo).

A navigation bar and a toolbar usually share one list of items. Give both bars the same `items` and a `part`:
`part="top"` draws the navigation bar's items and the More menu, `part="bottom"` the toolbar's, and both split them
the same way, so nothing shows twice or goes missing. Mail's message does this (pictures in section 6).

```tsx
<DuoPage
  topBar={<DuoBar part="top" items={items} renderItem={renderItem} renderOverflow={renderMore} />}
  bottomBar={<DuoBar part="bottom" items={items} renderItem={renderItem} />}
/>
```

<img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/bars-phone.png" width="200">

### 4. A list and its detail: `PaneLayout arrangement="list-detail"`

One pane at a time on a phone, on the closed iPhone Duo and in half the display: the list, then the detail. Side by
side on the open iPhone Duo and an iPad, with the list about a third of the width, like Notes; when the device is
partly folded, the fold divides them in halves.

```tsx
<PaneLayout
  arrangement="list-detail"
  compact={selected ? 'trailing' : 'leading'}   // which one pane shows when there is room for one
  leading={<Inbox onOpen={setSelected} />}
  trailing={<Message id={selected} />}
  leadingFraction={0.35} minLeadingWidth={320}  // optional: the list's width
  leadingStyle={styles.list}                    // optional: either pane, or both with `style`
/>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-partlyFolded-m2.png" width="330"> |

`split="always" | "never"` forces two panes or one; an active fold still divides.

### 5. Going deeper in the detail: `DetailStack`

The detail pane keeps its own stack, the way a split view does. Beside the list, the first detail screen has no Back;
deeper screens do, and Back pops within the pane. With one pane at a time, Back walks deeper → detail → list. Folding
and unfolding keep the whole stack. Picking another row starts it over.

```tsx
<PaneLayout
  arrangement="list-detail"
  compact={selected ? 'trailing' : 'leading'}
  leading={<Inbox onOpen={setSelected} />}
  trailing={
    <DetailStack key={selected} onExit={() => setSelected(null)}>
      <Message id={selected} />
    </DetailStack>
  }
/>

function Message({id}) {
  const {push, back, showBack} = useDetailStack();
  // showBack: false on the first screen beside the list, true otherwise
  return <Button title="Open attachment" onPress={() => push(<Attachment id={id} />)} />;
}
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-phone-deep.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-closed-deep.png" width="240"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-openLandscape-deep.png" width="420"> |

Props: `onExit`, `screenStyle`, `showBackOnRoot` (override the rule), `renderStack(screens, top)` for your own
transition or navigator: each screen's element already tells the screens under the top one that their pane is
hidden, so their bars stay out of the strip, and you hide them (see [Settings](#settings-a-detailstack-drawn-your-way)).
With Expo Router or React Navigation, put a nested stack in the trailing pane instead and draw Back when
`detailShowsBack(depth, usePane().split)` (from `/layout`) is true.

### 6. Half the display and closed landscape

In Split View the app gets half the open display: one pane at a time, like a phone, with the strip on the edge away
from the other app. Closed in landscape, the strip runs down the trailing edge and stops short of the camera.

| Leading half | Trailing half | Closed, landscape |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-splitHalfLeading-m2.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-splitHalfTrailing-m2.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-closedLandscape-m2.png" width="330"> |

Nothing to write: `DuoPage` and `PaneLayout` read the edge and the size class the system gives each window.

### 7. A sheet over a map: `PaneLayout arrangement="sheet"`

Apple's overlay arrangement: the sheet stays over the map in every pose, and only an active fold puts the map on one
side and the sheet on the other. On a wide window keep the sheet a card at the bottom center.

```tsx
<PaneLayout arrangement="sheet" leading={<Map />} trailing={<PlaceSheet />} />
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-partlyFolded.png" width="330"> |

`side-by-side` puts two contents next to each other when wider than tall and stacks them when taller than wide.

### 8. A layout that follows the pane's shape: `usePane()`

Inside a pane, size to the pane, never the window. Calculator puts five columns on the closed iPhone Duo's squarer
display and four on a phone:

```tsx
const {width, height, split, side, x, y, hidden} = usePane();
const columns = height / width < 1.8 ? 5 : 4;

// Partly folded, either way up, give the display and the keys one side of the fold each.
const fold = useFold();
return fold ? <PaneLayout arrangement="side-by-side" leading={<Display />} trailing={<Keys />} /> : <Calculator />;
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-phone.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-closed.png" width="240"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-openLandscape.png" width="420"> |

| Closed, landscape | Partly folded | Open and rotated, partly folded |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-closedLandscape.png" width="300"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-partlyFolded.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/keypad-partlyFoldedTabletop.png" width="250"> |

### 9. Grids with no column on the fold: `useEvenColumns`

```tsx
const columns = useEvenColumns(150, {gap: 12, inset: 32}); // 1, 2 or 4, never 3
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/grid-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/grid-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/grid-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/grid-partlyFolded.png" width="330"> |

### 10. Controls clear of the fold and the cameras: `AvoidReservedRegions`, `useFold`

```tsx
<AvoidReservedRegions>
  <Button title="Pay" />
</AvoidReservedRegions>
```

It moves the control by the smallest step that clears an active fold or camera, and does nothing where there is none.
Scrolling content may pass under the fold; only tappable controls move. `useFold()` and `useReservedRegions()` give
the frames; `useCameraClearance()` and `clearancePadding()` keep an immersive screen clear of the cameras.

| Normal iPhone | iPhone Duo, closed | Partly folded | Tabletop |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/fold-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/fold-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/fold-partlyFolded.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/fold-partlyFoldedTabletop.png" width="250"> |

### 11. A sheet of your own: `useSheetPose`

```tsx
const {placement, vertical, edge, clearance, columnInsetTop} = useSheetPose({placement: 'automatic', verticalBarBehavior: 'automatic', columnWidth: 64});
// placement: {side: 'full' | 'center' | 'leading' | 'trailing', x, y, width, height}
// columnInsetTop: the vertical column's top padding, below any camera over it

<DuoOverlay>{/* the sheet */}</DuoOverlay> // drawn in the DuoOverlayHost around your screens, above DuoPage's side strip
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-phone-open.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-closed-open.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-openLandscape-open.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-partlyFolded-open.png" width="330"> |

### 12. Everything the package reads: `useDuo`, `useSizeClass`, `useVerticalBarEdge`, `useCameraDirections`

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/pose-phone.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/pose-closed.png" width="240"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/pose-openLandscape.png" width="420"> |

| You need | Use |
| --- | --- |
| One pane or two | `useSizeClass()`, `useSplitWindow()` |
| The bar edge, and room for your bar | `useVerticalBarEdge()`, `useBarInsets(barWidth)` (zero for a pane away from the edge) |
| The camera that faces the person | `useCameraDirections()`, `forwardCamera()`, `shouldMirror()` |
| Apple's arrangement view, exactly | `<Arrangement kind axes collapsed primary secondary />` from `/layout` |
| The math behind the components | `verticalBarLayout()`, `pageMode()`, `sidebarWidth()`, `sheetPlacement()`, `evenColumnCount()`, `avoidanceOffset()` from `/layout` |

### 13. Test every pose

```tsx
import {DuoTestProvider, POSE_NAMES} from '@garrettmacmac/react-native-duo/testing';

it.each(POSE_NAMES)('checks out in %s', async pose => {
  await render(<DuoTestProvider pose={pose}><CheckoutScreen /></DuoTestProvider>);
  expect(screen.getByRole('button', {name: 'Pay'})).toBeOnTheScreen();
});
```

Poses: `phone`, `iPad`, `closed`, `closedLandscape`, `openPortrait`, `openLandscape`, `partlyFolded`,
`partlyFoldedTabletop`, `splitHalfLeading`, `splitHalfTrailing`, `pipPinned`. Their sizes and frames are fixtures laid
out like Apple's diagrams, not Apple's numbers (Apple publishes none); build your own `Pose` from a device log when you
need real ones. On a Mac, check the real thing in Xcode 27.1's Device Hub.

### 14. Turning the device: closed landscape, open and rotated, tabletop

Every component reads the pose again on each rotation, so there is nothing to handle yourself. What changes:

- **Closed, turned on its side.** The strip stays on the trailing edge and stops short of the camera, which is now at
  the bottom corner. A bar with too many items for the shorter strip puts the rest in More.
- **Open and turned (the fold across the middle, lying flat).** Apple keeps bars horizontal here, so `DuoPage` puts
  them on top and at the bottom, like an iPad. A list and its detail stack above and below the fold.
- **Open, turned and partly folded (tabletop).** The fold is active, so `PaneLayout` gives the top half to what you
  look at and the bottom half to what you touch, and `AvoidReservedRegions` lifts controls off the fold.

| Mail, open and rotated | Mail, tabletop | Map, tabletop | Sheet, open and rotated | Sheet, tabletop |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-openPortrait-m2.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/mail-partlyFoldedTabletop-m2.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/map-partlyFoldedTabletop.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-openPortrait-open.png" width="200"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/sheet-partlyFoldedTabletop-open.png" width="200"> |

Every advanced case below also shows the tabletop pose.

## Advanced cases

Ten whole screens, each built on one part of the API, in the example app's **Cases** tab (`?case=<name>` on the web).
Each shows a normal iPhone, the closed iPhone Duo, the open one, and the open one rotated and partly folded.

### Calendar: a different bar for the strip

`sideTopBar`, `sideBottomBar`. On a phone the top bar is a segmented control and the bottom bar three text buttons. Neither can stand, so the strip gets components of their own: one button that cycles the view, and three symbols.

```tsx
<DuoPage
  topBar={<Segmented value={view} onChange={setView} />}
  sideTopBar={<Actions actions={[close, add, cycleView]} vertical />}
  bottomBar={<TextToolbar labels={['Today', 'Calendars', 'Inbox']} />}
  sideBottomBar={<Actions actions={[today, calendars, inbox]} vertical />}
  topBarStyle={{paddingTop: insets.top}}
  sideInsetTop={Math.max(insets.top, useCameraClearance().top)}
  sideStyle={{width: 64, gap: 8, backgroundColor: colors.surface}}>
  <Week />  {/* draws "October · Week" itself when usePage().vertical */}
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-calendar-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-calendar-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-calendar-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-calendar-partlyFoldedTabletop.png" width="250"> |

### Music: the whole strip drawn by you

`renderSide`. `renderSide` receives what would go in the strip (this page's bars and any nested page's, top and bottom), its edge, and the room to keep free, and draws it however it likes: here a tinted strip with the album art above the transport and a border on the side facing the content. Partly folded, the art and the track take one side of the fold each.

```tsx
<DuoPage
  topBar={placement => <NavBar placement={placement} title="Now Playing" />}
  bottomBar={placement => <Transport vertical={placement.vertical} />}
  renderSide={({edge, top, bottom, insetTop, insetBottom}) => (
    <View style={[styles.side, {paddingTop: insetTop, paddingBottom: insetBottom}, edge === 'trailing' ? styles.borderStart : styles.borderEnd]}>
      {top}
      <View style={{flex: 1}} />
      <Artwork size={44} />
      {bottom}
    </View>
  )}>
  {fold ? <PaneLayout arrangement="side-by-side" leading={<Cover />} trailing={<Track />} /> : <NowPlaying />}
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-music-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-music-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-music-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-music-partlyFoldedTabletop.png" width="250"> |

### Canvas: bars on the side everywhere

`mode="side"`, `onModeChange`. A drawing app keeps its tool palette standing on the side even on a normal iPhone. `mode="auto"` (the last picture) follows the pose instead. `onModeChange` reports where the bars went. The card steps off the fold with `AvoidReservedRegions`.

```tsx
const [mode, setMode] = useState<PageMode>('horizontal');

<DuoPage mode="side" onModeChange={setMode} topBar={placement => <Palette vertical={placement.vertical} />}>
  <AvoidReservedRegions>
    <Card>Bars: {mode}</Card>
  </AvoidReservedRegions>
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | Normal iPhone, `mode="auto"` |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-canvas-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-canvas-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-canvas-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-canvas-partlyFoldedTabletop.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-canvas-phone-auto.png" width="160"> |

### Chat: a pane that keeps its own bars

`shareSide={false}`. The tabs stand in the strip and the chat list gives its bar to it, but the conversation keeps its header and composer in its own pane: a text field cannot stand, and people type under the messages in every pose.

```tsx
<DuoPage bottomBar={placement => <Tabs vertical={placement.vertical} />}>
  <PaneLayout
    arrangement="list-detail"
    compact={open ? 'trailing' : 'leading'}
    leading={<DuoPage topBar={placement => <NavBar placement={placement} title="Chats" />}><ChatRows /></DuoPage>}
    trailing={
      <DuoPage shareSide={false} topBar={<ConversationHeader />} bottomBar={<Composer />}>
        <Messages />
      </DuoPage>
    }
  />
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | Half the display |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-chat-phone-open.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-chat-closed-open.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-chat-openLandscape-open.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-chat-partlyFoldedTabletop-open.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-chat-splitHalfLeading-open.png" width="170"> |

### Photos: a DuoBar with every part your own

`DuoBar` `part`, `renderItem`, `renderGroup`, `renderOverflow`, `title`, styles. One list of items split across the navigation bar and the toolbar. Done never goes to More; the low-priority edits go first, as on the closed iPhone Duo in landscape (last picture).

```tsx
const items = [
  {key: 'done', role: 'navigation', icon: true, title: 'Done'},
  {key: 'share', role: 'prominent', icon: true, title: 'Share'},
  {key: 'favorite', icon: true, title: 'Favorite', group: 'mark'},
  {key: 'info', icon: true, title: 'Info', group: 'mark'},
  {key: 'rotate', icon: true, title: 'Rotate', bar: 'bottom', group: 'adjust', priority: 'low'},
  {key: 'crop', icon: true, title: 'Crop', bar: 'bottom', group: 'adjust', priority: 'low'},
  {key: 'edit', icon: true, title: 'Edit', bar: 'bottom', group: 'edit'},
  {key: 'trash', icon: true, title: 'Delete', bar: 'bottom'},
];

const bar = (part: 'top' | 'bottom') => (
  <DuoBar
    part={part}
    items={items}
    renderItem={(item, {vertical}) => <BarButton action={item} vertical={vertical} />}
    renderGroup={(children, group, {vertical}) => <Capsule vertical={vertical}>{children}</Capsule>}
    renderOverflow={(more, {vertical}) => <MoreMenu items={more} vertical={vertical} />}
    title={part === 'top' ? <Text>Saturday · 2:14 PM</Text> : undefined}
    itemLength={60}
    insetTop={sideInsetTop}
    insetBottom={useCameraClearance().bottom}
    horizontalStyle={part === 'top' ? styles.navBar : styles.toolbar}
    verticalStyle={{gap: 8}}
  />
);

<DuoPage topBar={bar('top')} bottomBar={bar('bottom')}>
  <Viewer />
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | Closed, landscape |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-photos-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-photos-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-photos-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-photos-partlyFoldedTabletop.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-photos-closedLandscape.png" width="300"> |

### Settings: a DetailStack drawn your way

`DetailStack` `renderStack`, `popToRoot`, `depth`. `renderStack` slides each new screen in and adds the path along the bottom. A button on any deeper screen calls `popToRoot`. The pictures are three screens deep: General, About, Legal.

```tsx
<DetailStack
  key={section}
  onExit={() => setSection(null)}
  renderStack={(screens, top) => (
    <View style={{flex: 1}}>
      {screens.map((screen, index) => (
        <View key={screen.key} style={[{flex: 1}, index !== top && {display: 'none'}]}>
          {index === 0 ? screen.element : <SlideIn>{screen.element}</SlideIn>}
        </View>
      ))}
      {top > 0 ? <Trail titles={screens.slice(0, top + 1).map(titleOf)} /> : null}
    </View>
  )}>
  <SettingsPage section={section} />
</DetailStack>

function SettingsPage({title, rows}) {
  const {push, back, popToRoot, depth, showBack} = useDetailStack();
  // Back when showBack; "Back to the top" (popToRoot) when depth > 1; each row push()es the next page.
}
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | iPad |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-settings-phone-deep.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-settings-closed-deep.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-settings-openLandscape-deep.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-settings-partlyFoldedTabletop-deep.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-settings-iPad-deep.png" width="220"> |

### Files: a sidebar sized and styled

`PaneLayout` `leadingFraction`, `minLeadingWidth`, `maxLeadingWidth`, `leadingStyle`, `trailingStyle`. Where nothing divides the window (an iPad, the open iPhone Duo lying flat), the list takes `leadingFraction` of the width within its minimum and maximum. An active fold still divides: partly folded, each takes a side.

```tsx
<PaneLayout
  arrangement="list-detail"
  compact={location ? 'trailing' : 'leading'}
  leadingFraction={0.28}
  minLeadingWidth={200}
  maxLeadingWidth={280}
  leadingStyle={{backgroundColor: colors.raised}}
  trailingStyle={{backgroundColor: colors.background}}
  leading={<Locations />}
  trailing={<FileGrid />}  {/* useEvenColumns inside */}
/>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | iPad | Partly folded |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-files-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-files-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-files-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-files-iPad.png" width="220"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-files-partlyFolded.png" width="330"> |

### Translate: two contents at once

`PaneLayout arrangement="side-by-side"`. Stacked when the window is taller than wide, side by side when wider than tall, one on each side of an active fold. Each side reads its own frame from `usePane()`.

```tsx
<PaneLayout
  arrangement="side-by-side"
  leading={<Side language="English" />}
  trailing={<Side language="Spanish" />}
/>

function Side() {
  const {side, width, height} = usePane(); // 'leading' | 'trailing' | 'only'
}
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | Partly folded |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-translate-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-translate-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-translate-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-translate-partlyFoldedTabletop.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-translate-partlyFolded.png" width="330"> |

### Camera: controls you place yourself

`useVerticalBarEdge`, `useBarInsets`, `AvoidReservedRegions`, `useCameraDirections`, `forwardCamera`, `shouldMirror`. No `DuoPage`: the controls stand on the bar edge when there is one and sit at the bottom otherwise, the viewfinder keeps clear of them, the shutter steps off the fold, and the preview uses whichever camera faces the person, mirrored when it does. On the web the camera directions read `unavailable`.

```tsx
const edge = useVerticalBarEdge();                 // 'leading' | 'trailing' | null
const insets = useBarInsets(96);                   // {leading, trailing, top, bottom}
const directions = useCameraDirections();
const camera = forwardCamera(directions);
const mirrored = camera ? shouldMirror(camera, directions) : false;

<View style={{flex: 1}}>
  <Viewfinder camera={camera} mirrored={mirrored} style={{marginStart: insets.leading, marginEnd: insets.trailing}} />
  <View style={edge ? (edge === 'leading' ? styles.leadingColumn : styles.trailingColumn) : styles.bottomRow}>
    <AvoidReservedRegions>
      <Shutter />
    </AvoidReservedRegions>
  </View>
</View>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-camera-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-camera-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-camera-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-camera-partlyFoldedTabletop.png" width="250"> |

### Video: bars that never move, and Apple’s arrangement view

`mode="horizontal"`, `Arrangement` from `/layout`. A player keeps its controls where they are in every pose, so its page never moves them; on the closed iPhone Duo the top bar drops below the camera with `useCameraClearance`. The video and its comments are a split `Arrangement`: stacked when taller than wide, side by side when wider, one on each side of an active fold.

```tsx
import {Arrangement} from '@garrettmacmac/react-native-duo/layout';

<DuoPage
  mode="horizontal"
  topBarStyle={{paddingTop: Math.max(insets.top, useCameraClearance().top)}}
  topBar={<NavBar title="Mountain Timelapse" />}>
  <Arrangement kind="split" primary={<Player />} secondary={<Comments />} />
</DuoPage>
```

| Normal iPhone | iPhone Duo, closed | iPhone Duo, open | Open and rotated, partly folded | Partly folded |
| --- | --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-video-phone.png" width="160"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-video-closed.png" width="190"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-video-openLandscape.png" width="330"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-video-partlyFoldedTabletop.png" width="250"> | <img src="https://raw.githubusercontent.com/garrettmac/react-native-duo/main/docs/cases/case-video-partlyFolded.png" width="330"> |

## Apple's pictures, one by one

Every picture on [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo),
what is in it, and what handles it here.

| Apple's picture | What it shows | Here |
| --- | --- | --- |
| Home Screen, outer and inner | The two displays | The `closed` and `open*` poses |
| Six poses | Closed, standing closed, open landscape, partly folded, open portrait, tabletop | `closed`, `closedLandscape`, `openLandscape`, `partlyFolded`, `openPortrait`, `partlyFoldedTabletop` |
| Outer display layout | Hinge on the leading side, camera in the top trailing corner | `closed` pose; `useCameraClearance()`; the strip starts under the camera |
| Inner display layout | Hinge down the middle, camera beside it at the top | `openLandscape` pose; `useFold()`; `useReservedRegions()` |
| Inner safe area | The folding region and the inner camera region | `useReservedRegions({kind: 'division'})`, `{kind: 'occlusion'}`; `AvoidReservedRegions` |
| Outer safe area | The outer camera region | `useCameraClearance()`, `DuoPage` `sideInsetTop` |
| Dynamic Island, status bar, toolbar, tab bar | One strip on the trailing edge, toolbar on top, tab bar at the bottom | `DuoPage` `topBar` and `bottomBar` (section 2) |
| Compact layout, full tab bar | Closed landscape: the toolbar folds into "…" | `compression: 'prefersTabBar'`, `DuoBar` `renderOverflow` (section 3) |
| Compact layout, full toolbar | Closed landscape: the tab bar shrinks to one button; Share alone, two items in one capsule | `compression: 'prefersBarItems'`, `group` (section 3) |
| Mail, closed | Back, a capsule, then at the bottom a capsule and Compose; the subject in the content | `DuoPage` + `DetailStack` + `group` (sections 2 and 5) |
| Mail, open | The list's controls on top of its pane, the message's on the trailing edge, search at the bottom of the list | Nested `DuoPage`s in `PaneLayout list-detail` (sections 2 and 4) |
| Leading pane, trailing pane, their controls | The same, labeled | `usePage().mode`: `horizontal` for the list, `hosted` for the message |
| Notes, fully open | The list narrower than the note | `leadingFraction`, `minLeadingWidth` (section 4) |
| Notes, partly folded | The list and the note in halves at the fold | An active fold divides `PaneLayout` (section 4) |
| Split View multitasking | Each app's controls on the edge away from the other | `splitHalfLeading`, `splitHalfTrailing`; `DuoPage` follows each window's edge (section 6) |
| Overlay arrangement | A smaller primary view over the secondary, bottom center | `PaneLayout arrangement="sheet"`, `<Arrangement kind="overlay">` (section 7) |
| Split arrangement | Primary and secondary in halves | `PaneLayout arrangement="side-by-side"`, `<Arrangement kind="split">` |
| Calculator | Four columns on a phone, five on the closed iPhone Duo | `usePane()` (section 8) |
| Apple's page card | Notes in many poses | `DuoTestProvider` with `POSE_NAMES` (section 13) |

## Apple's APIs, and what this package maps them to

| Apple | Here | Where it runs |
| --- | --- | --- |
| `horizontalSizeClass`, `verticalSizeClass` | `useSizeClass()` | iOS native; from the window elsewhere |
| `UITraitCollection.verticalBarEdge`, `toolbarVerticalEdge` | `useVerticalBarEdge()` | iOS 27.1 |
| `UIView.reservedRegions(kind:options:)`, `ReservedRegion` | `useReservedRegions()`, `useFold()`, `AvoidReservedRegions` | iOS 27.1; folds on Android |
| `UIArrangementViewController`, `ArrangementView` (split, overlay, `axes`, collapse) | `<PaneLayout>`, `<Arrangement>` (`/layout`) |
| Bars per pane, the vertical bar strip | `<DuoPage>`, `<DuoBar>`, `usePage()` | everywhere (JS) |
| `UISplitViewController` collapse and expand, primary column width, the secondary column's stack | `<PaneLayout arrangement="list-detail">`, `<DetailStack>` | everywhere (JS) |
| Toolbar order, `visibilityPriority`, `axisBehavior`, `UIVerticalBarCompressionBehavior`, the overflow menu | `useVerticalBar()`, `verticalBarLayout()` | everywhere (JS) |
| `UISheetPresentationController.preferredPlacement`, `preferredVerticalBarBehavior` | `useSheetPose()`, for sheets drawn in JavaScript | everywhere (JS) |
| `AVCaptureDeviceDirectionCoordinator` | `useCameraDirections()` | iOS 27.1 |
| Even grid columns, safe areas, layout margins | `useEvenColumns()`, `useBarInsets()`, `useCameraClearance()` | everywhere (JS) |
| Jetpack WindowManager `FoldingFeature` | `useFold()`, `useReservedRegions({kind: 'division'})` | Android |

Not wrapped:

- The camera capture scene accessory (`UISceneAccessory.cameraCapture`), which hosts a second scene on the outer
  display while the rear camera records. It needs its own React root inside a system-owned scene, and Apple treats it
  as an enhancement only.
- `preferredPlacement` on native sheets (React Navigation's `formSheet`, Expo Router's sheet presentation). Those are
  `UISheetPresentationController`s owned by the navigator; the setting has to come from the navigator.
- Native bars (`UINavigationBar`, `UITabBar`, `UIToolbar`) need nothing from this package; they already stand on the
  side.

## Agents

The package carries Apple's Duo guidance as rules for coding agents, so a session working in your app writes screens
that hold up in every pose without being told.

```sh
npx @garrettmacmac/react-native-duo agents                  # CLAUDE.md, a Claude Code skill, AGENTS.md (and Cursor if .cursor/ exists)
npx @garrettmacmac/react-native-duo agents --only claude,cursor
npx @garrettmacmac/react-native-duo agents --remove
```

Use the scoped name: the plain `react-native-duo` on npm is someone else's package.

What it writes, each in one marked block you can re-run or remove. Every file points at the installed package, so the
rules update with it; re-run after upgrading if the paths change.

- **Claude Code**: a `CLAUDE.md` line `@node_modules/@garrettmacmac/react-native-duo/rules/core.md`, which loads ten
  short core rules into every session, and `.claude/skills/react-native-duo/SKILL.md`, a skill that loads the full
  rules when you build UI.
- **AGENTS.md** (Codex, Jules, Amp, Gemini CLI and others): a short section pointing at the core and full rules.
- **Cursor**: `.cursor/rules/react-native-duo.mdc`, the core rules, always applied.

Or install the skill as a Claude Code plugin, without touching the project:

```
/plugin marketplace add garrettmac/react-native-duo
/plugin install react-native-duo@react-native-duo
```

The rules live in [`rules/`](rules): [core.md](rules/core.md) (always loaded), [duo.md](rules/duo.md) (the full
rules and API) and [apple-guidelines.md](rules/apple-guidelines.md) (Apple's guidance behind them, with sources).

## Example app

[`example/`](example) is an Expo app that uses every API: a map with a sheet, a Mail-style split view, an even grid,
fold avoidance, a custom sheet, the live pose, the ten [advanced cases](#advanced-cases) and a pose picker that previews the app as a closed or open iPhone Duo,
partly folded, in a split view or on an iPad, even in Expo Go or a browser.

```sh
cd example
npm install
npx expo start          # Expo Go or the web: pose previews, no native regions
npx expo run:ios        # a development build with the native module; pick the iPhone Duo simulator
```

## How it works

- **iOS.** A hidden `DuoObserverView` at the root reads `UIView.reservedRegions(kind:options:)`, the
  `verticalBarEdge` trait and the size classes, and reports on every layout, trait and safe-area change, only when
  something changed. The 27.1 symbols sit in Objective-C behind `__IPHONE_OS_VERSION_MAX_ALLOWED >= 270100` and
  `@available(iOS 27.1, *)`, so the module builds with older SDKs and runs on older iOS (no edge, no regions). Camera
  directions use `AVCaptureDeviceDirectionCoordinator`, looked up at run time, only while `useCameraDirections()` is
  mounted.
- **Android.** The same view collects Jetpack WindowManager's `FoldingFeature`s: a fold is a `division`, active while
  half-opened; the size class comes from the window (600dp wide, 480dp tall).
- **Everywhere else** the hooks read `useWindowDimensions()`.
- Frames are in the provider's root view's points. `placedFrame()` turns a physical frame into an absolute style that
  stays right in right-to-left layouts.

**Status.** The JavaScript is covered by jest in every pose, and the example bundles for iOS and the web. The Swift,
Objective-C and Kotlin follow Apple's and Google's documentation but have not yet been compiled against the iOS 27.1
SDK or run on a device; build the example on a Mac with Xcode 27.1 before relying on the native side.

## Contributing

```sh
npm install
npm test            # jest, every pose
npm run typecheck
npm run build       # build/ (CommonJS and types)
```

Edit the agent rules in `rules/`; `npm run sync-agents` copies them into the skill and the version into the plugin, and
the tests fail if they drift. [AGENTS.md](AGENTS.md) is for agents working on this package.

## License

MIT
