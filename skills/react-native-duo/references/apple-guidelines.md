# Apple's iPhone Duo guidance, summarized for React Native

A condensed reading of Apple's published guidance, with short quotes. Read the sources for the full text; when they
change, they win.

- **HIG**: [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) (new page, September 9, 2026)
- **Docs**: [Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo)
- **Talk A**: [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466/)
- **Talk B**: [Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/)
- **Cameras**: [Choosing a camera by the direction it faces](https://developer.apple.com/documentation/avkit/choosing-a-camera-by-the-direction-it-faces)

Each line ends with the package API that implements it in React Native.

## The device

- Two displays, each with a front camera; a center hinge. Closed, the outer display is "wider and shorter than a
  traditional iPhone". Open, the inner display is "the largest, most immersive display ever on an iPhone". (HIG, Talk A)
- Poses: partly folded like a book, on a table like a laptop, standing on its edges, rotated; a 50/50 split view; a
  pinned picture-in-picture video that makes "your current app resize vertically to fit the space that's left". (Talk A)
  → `poses`, `DuoTestProvider`

## Layout

- "Use size classes so your app adapts naturally." "A compact width layout for the outer display and a regular width
  layout for the inner display give you the fundamentals for every pose." (HIG) "Avoid fixed widths, breakpoints, or
  any metrics tied to a specific screen." (Talk A) → `useSizeClass()`
- "Make layout calculations based on your scene or containing view's bounds rather than screen dimensions." "Don't use
  userInterfaceIdiom or UIInterfaceOrientation for layout decisions." (Docs) Avoid the main screen; it "will be
  deprecated". (Talk B) → `usePane()`
- "Don't reinvent your app when it resizes; allow the existing layout to expand." (HIG) "You don't want just a
  stretched out iPhone app." "Make sure your hierarchy doesn't change between the outer and inner displays." (Talk A)
- "Keep functionality and the state of elements the same between displays." Mail shows a list or an email closed, both
  side by side open. (HIG) → `PaneLayout arrangement="list-detail"`
- Inner display options: a split view; a stacked layout that becomes two columns with more width; a tab bar shown as a
  sidebar for information-dense apps. (Talk A)
- Safe areas and layout margins are asymmetric: "avoid assuming that insets on opposite sides are equal". Foreground
  controls inside the safe area; backgrounds may extend behind bars. (Talk B) → `useBarInsets()`

## Reserved regions

- The outer camera ("always present, and expands into the Dynamic Island for Live Activities"), the inner camera ("only
  present when the camera is active") and the folding region ("conditional"; it divides the inner display while
  partly open). (HIG) → `useReservedRegions()`
- A region is active or inactive; the fold is active partly open, inactive fully open. (Docs)
- "Adapt your layout when the device folds." "In a grid-style layout, prefer an even number of columns." (HIG)
  → `useEvenColumns()`
- "Avoid extreme layout changes as people fold the device. Move only what's necessary." (HIG)
- System sheets, alerts, menus and toolbar buttons nudge themselves out of the fold; custom components must do it
  themselves. "Scrollable content doesn't need to avoid this region." Partly folded in portrait, "interactive elements
  move to the bottom half". (Talk A) → `<AvoidReservedRegions>`, `useFold()`
- An optional tabletop layout must keep "all the same controls and general hierarchy as other poses". (Talk A)

## Arrangement views

- Split: side by side when wider than tall, stacked when taller than wide, around the fold. Overlay: primary atop
  secondary; partly folded, "the views move to occupy each side". You can limit a split's axes and collapse an
  overlay's secondary view. (HIG, Docs) → `<Arrangement>`, `<PaneLayout>`
- Overlay partly open: primary in the trailing or bottom part, secondary in the leading or top part. (Docs)
- "Keep navigation outside of arrangement views." Avoid putting one inside a split view, list or scroll view. (HIG, Docs)

## Vertical controls

- Toolbars, tab bars and navigation controls move to the side except on the inner display in portrait. They share the
  strip with the status bar and the Dynamic Island. (HIG, Talk A) → `useVerticalBarEdge()`
- In a split view "each one places controls along its outer edge". Vertical controls "stay on the same side in
  right-to-left languages". (HIG)
- Order: "Reserve the top of the vertical axis for primary navigation controls, like Back or Close, followed by
  prominent actions, like Done." Top bar items go to the top, bottom toolbar items to the bottom, a tab bar stays
  bottom aligned. (HIG, Talk A) → `useVerticalBar()`
- "Items overflow from bottom to top by default"; set a visibility priority; keep frequent actions and badged items
  visible longest. (HIG) → `priority`
- Give every item a title and a symbol; an item with only a title, or a custom view, does not stand vertical; text
  buttons and segmented controls stay in a horizontal bar. (HIG, Docs, Talk A) → `icon`, `title`, `axisBehavior`
- Navigation screens overflow toolbar items first; task screens minimize the tab bar first. (HIG)
  → `compression`
- "Use the system overflow menu." "Reserve the ellipsis symbol for overflow." (HIG)
- "Locate controls near the content they affect": controls for the leading pane stay above it. (HIG)
- Content is offset from the bar; immersive, non-scrolling interfaces may span the full width; a background or header
  may run under the bar while scrolling content stays inset. (HIG, Talk A) → `useBarInsets()`, `useCameraClearance()`
- "In general, don't override the default bar placement." (HIG)

## Sheets

- Outer display: sheet controls move to the side by default; disable the vertical bar for a sheet with a single
  button, and it then "stops just short of the front-facing camera". Inner display: horizontal bars. Partly folded:
  sheets "slide over to avoid resting in the fold". (Talk A)
- Inner display sheets are centered by default; `preferredPlacement` can choose leading or trailing, and a trailing
  sheet's toolbar may stand vertical. (Docs, Talk B) → `useSheetPose({placement, verticalBarBehavior})`

## Cameras

- A camera's direction depends on the display the app is on and changes as the device opens and closes; ask which
  cameras face forward instead of inferring from type or position, and mirror by direction. (Cameras)
  → `useCameraDirections()`, `forwardCamera()`, `shouldMirror()`
- An app capturing from the rear camera can show content to the subject on the outer display through a camera capture
  scene accessory; treat it as an enhancement. (Docs) Not wrapped by this package yet.

## Games

- "Make your game playable in every device pose." Fill the screen, keep text and control sizes consistent, prefer
  changing the aspect ratio over letterboxing. (HIG)

## Testing

- Use Device Hub in Xcode 27.1 to open, close, rotate and fold the iPhone Duo simulator, and drag the app to either
  side of a split view. (HIG, Talk B) → `DuoTestProvider` covers the same poses in jest.
