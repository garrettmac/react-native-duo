# Working on @garrettmacmac/react-native-duo

This file is for agents changing this package. The rules for apps that use it are in `rules/` (`core.md` always
loaded, `duo.md` in full, `apple-guidelines.md` for the reasons), and `npx @garrettmacmac/react-native-duo agents` points
an app at them.

- `src/` is the TypeScript API. The root entry stays small: a hook or component an app screen uses. Pure layout math
  and the lower-level `Arrangement` go in `src/layout.ts`; test helpers in `src/testing.ts`.
  `src/__tests__/public-api.test.tsx` pins all three lists.
- `ios/` is Swift plus Objective-C. Any iOS 27.1 symbol sits behind `__IPHONE_OS_VERSION_MAX_ALLOWED >= 270100` and
  `@available(iOS 27.1, *)` or a run-time lookup, so the module still builds with older Xcode.
- `android/` is Kotlin on Jetpack WindowManager. Keep its props and functions in step with iOS.
- A change to the API updates `rules/duo.md` (and `rules/core.md` when it changes a core rule), `README.md`,
  `CHANGELOG.md` and the example in `example/`.
- Edit rules only in `rules/`. `npm run sync-agents` copies them into `skills/react-native-duo/references/` and the
  version into `.claude-plugin/plugin.json` and `android/build.gradle`; the tests fail if they drift.
- Every value in `example/` comes from `example/src/theme.ts`.

Before a pull request: `npm run typecheck`, `npm test`, `npm run build`, and in `example/` `npx tsc --noEmit` and
`npx expo export --platform web`.
