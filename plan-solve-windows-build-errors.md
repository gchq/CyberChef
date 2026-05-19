# Plan: Fix Windows `npm run build` webpack errors

## Context

`npm run build` fails on Windows with 7 webpack errors (exit code 1).

The two visible error classes are:

1. **jimp babel-loader conflict**: `Module parse failed: Identifier 'e' has already been declared` at `node_modules/jimp/dist/browser/index.js:31135`. Babel is transforming jimp's pre-minified browser bundle, which produces invalid JS. On macOS/Linux, jimp is correctly excluded from babel-loader; on Windows, the exclude regex silently fails.

2. **Asset Modules Plugin — invalid generator**: `generator has an unknown property 'filename'` on `asset/inline` type. First-party images (e.g. `src/web/static/images/file-128x128.png`) should match the `asset/resource` rule with a `filename` generator, but also match the `asset/inline` rule whose `exclude: /web\/static/` doesn't fire on Windows paths. Two rules matching causes webpack to reject the generator config.

## Root cause

All three bugs share one root cause: **regex path separators in [webpack.config.js](webpack.config.js) use literal `/` which doesn't match `\` on Windows**.

Webpack 5 matches `test` / `exclude` / `include` patterns against the module's **absolute file path**, which uses the OS-native separator. On Windows, paths contain `\`, so `/node_modules\//` doesn't match `C:\…\node_modules\jimp\…`.

Proof (from the verification terminal):

```
> node -e "const re = /node_modules\/(?!crypto-api|bootstrap)/; console.log(re.test('node_modules/jimp'), re.test('node_modules\\jimp'))"
true false

> node -e "const re = /web\/static/; console.log(re.test('src/web/static/x'), re.test('src\\web\\static\\x'))"
true false
```

## Changes

### Single file: [webpack.config.js](webpack.config.js)

Three regexes need `\/` → `[/\\]` (matches both forward and back slashes):

#### A. Line 145 — babel-loader exclude

```diff
-                exclude: /node_modules\/(?!crypto-api|bootstrap)/,
+                exclude: /node_modules[/\\](?!crypto-api|bootstrap)/,
```

**Effect**: On Windows, jimp (and all other non-allowlisted node_modules) are correctly excluded from babel-loader again. Fixes error 1.

#### B. Line 208 — bmfonts test

```diff
-                test: /(\.fnt$|bmfonts\/.+\.png$)/,
+                test: /(\.fnt$|bmfonts[/\\].+\.png$)/,
```

**Effect**: Font bitmap PNGs inside `bmfonts/` are matched on Windows too, so they get `asset/resource` with the `assets/fonts/[name][ext]` filename generator instead of falling through to the generic PNG rules. Not directly surfacing as an error today (the bmfonts files may not be in the current source tree), but would cause wrong asset handling on Windows if they were.

#### C. Line 224 — third-party image exclude

```diff
-                exclude: /web\/static/,
+                exclude: /web[/\\]static/,
```

**Effect**: First-party images in `src/web/static/` are correctly excluded from the `asset/inline` rule on Windows, so they only match the `asset/resource` rule above (which has the `filename` generator). Fixes error 2.

## Files modified

- [webpack.config.js](webpack.config.js) — 3 one-character regex changes (insert `[/\\]` in place of `\/`)

No new files, no new dependencies.

## Verification

1. `npm run build` on Windows — should now complete without webpack errors; `build/prod/` should contain the full output including `sha256digest.txt` with the correct hash stamped into `index.html`.
2. `npm run build` on macOS — should still work identically (forward slashes match `[/\\]`).
3. `npm start` on Windows — dev server should compile without errors (currently the dev server compiles with warnings but serves; after the fix it should be clean).
