# Prebuilt @garrettmacmac/react-native-duo

This branch holds `npm pack` output (with `build/`) so an app can install the package from GitHub before a version is
published to npm. Built from `main` at e1a725929fb665750fc6c65f9b8b9abc115e7990 (PR #1, DuoPage keeps its content
mounted when the pose changes). `scripts` are removed from package.json so a git install doesn't try to rebuild.

Install: `"@garrettmacmac/react-native-duo": "github:garrettmac/react-native-duo#<commit of this branch>"`.
Once the fix is on npm, switch back to the npm version.
