# Changelog
All notable changes to this project will be documented in this file.

## [8.0.0] - 2018-08-05
- Codebase rewritten using [ES modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) and [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) #284
- Operation architecture restructured to make adding new operations a lot simpler #284
- A script has been added to aid in the creation of new operations by running `npm run newop` @n1474335 #284
- 'Magic' operation added - [automated detection of encoded data](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic) @n1474335 #239
- UI updated to use [Bootstrap Material Design](https://fezvrasta.github.io/bootstrap-material-design/) @n1474335 #248
- `JSON`, `File` and `List<File>` Dish types added @n1474335 #284
- `OperationError` type added for better handling of errors thrown by operations @d98762625 #296
- A `present()` method has been added, allowing operations to pass machine-friendly data to subsequent operations whilst presenting human-friendly data to the user @n1474335 #284
- Set operations added @d98762625 #281
- 'To Table' operation added @JustAnotherMark #294
- 'Haversine distance' operation added @Dachande663 #325
- Started keeping a changelog @n1474335

## [7.0.0] - 2017-12-28
- Added support for loading, processing and downloading files up to 500MB @n1474335 #224

## [6.0.0] - 2017-09-19
- Added threading support, moving all recipe processing into a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to increase performance and allow long-running operations to be cancelled @n1474335 #173
- Created modules so that operations relying on large libraries can be downloaded separately as required, reducing the initial loading time for the app @n1474335 #173

## [5.0.0] - 2017-03-30
-  Configured Webpack build process, Babel transpilation and ES6 imports and exports @n1474335 #95

## [4.0.0] - 2016-11-28
-  Initial open source commit @n1474335


[8.0.0]: https://github.com/gchq/CyberChef/releases/tag/v8.0.0
[7.0.0]: https://github.com/gchq/CyberChef/releases/tag/v7.0.0
[6.0.0]: https://github.com/gchq/CyberChef/releases/tag/v6.0.0
[5.0.0]: https://github.com/gchq/CyberChef/releases/tag/v5.0.0
[4.0.0]: https://github.com/gchq/CyberChef/commit/b1d73a725dc7ab9fb7eb789296efd2b7e4b08306
