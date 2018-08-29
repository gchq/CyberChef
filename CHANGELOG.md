# Changelog
All notable changes to CyberChef will be documented in this file.


### [8.6.0] - 2018-08-29
- 'To Geohash' and 'From Geohash' operations added [@GCHQ77703] | [#344] 

### [8.5.0] - 2018-08-23
- 'To Braille' and 'From Braille' operations added [@n1474335] | [#255]

### [8.4.0] - 2018-08-23
- 'To Base85' and 'From Base85' operations added [@PenguinGeorge] | [#340]

### [8.3.0] - 2018-08-21
- 'To MessagePack' and 'From MessagePack' operations added [@artemisbot] | [#338]

### [8.2.0] - 2018-08-21
- Information links added to most operations, accessible in the description popover [@PenguinGeorge] | [#298]

### [8.1.0] - 2018-08-19
- 'Dechunk HTTP response' operation added [@sevzero] | [#311]

## [8.0.0] - 2018-08-05
- Codebase rewritten using [ES modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) and [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) [@n1474335] [@d98762625] [@artemisbot] [@picapi] | [#284]
- Operation architecture restructured to make adding new operations a lot simpler [@n1474335] | [#284]
- A script has been added to aid in the creation of new operations by running `npm run newop` [@n1474335] | [#284]
- 'Magic' operation added - [automated detection of encoded data](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic) [@n1474335] | [#239]
- UI updated to use [Bootstrap Material Design](https://fezvrasta.github.io/bootstrap-material-design/) [@n1474335] | [#248]
- `JSON`, `File` and `List<File>` Dish types added [@n1474335] | [#284]
- `OperationError` type added for better handling of errors thrown by operations [@d98762625] | [#296]
- A `present()` method has been added, allowing operations to pass machine-friendly data to subsequent operations whilst presenting human-friendly data to the user [@n1474335] | [#284]
- Set operations added [@d98762625] | [#281]
- 'To Table' operation added [@JustAnotherMark] | [#294]
- 'Haversine distance' operation added [@Dachande663] | [#325]
- Started keeping a changelog [@n1474335]

## [7.0.0] - 2017-12-28
- Added support for loading, processing and downloading files up to 500MB [@n1474335] | [#224]

## [6.0.0] - 2017-09-19
- Threading support added. All recipe processing moved into a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to increase performance and allowing long-running operations to be cancelled [@n1474335] | [#173]
- Module system created so that operations relying on large libraries can be downloaded separately as required, reducing the initial loading time for the app [@n1474335] | [#173]

## [5.0.0] - 2017-03-30
-  Webpack build process configured with Babel transpilation and ES6 imports and exports [@n1474335] | [#95]

## [4.0.0] - 2016-11-28
-  Initial open source commit [@n1474335] | [b1d73a72](https://github.com/gchq/CyberChef/commit/b1d73a725dc7ab9fb7eb789296efd2b7e4b08306)


[8.6.0]: https://github.com/gchq/CyberChef/releases/tag/v8.6.0
[8.5.0]: https://github.com/gchq/CyberChef/releases/tag/v8.5.0
[8.4.0]: https://github.com/gchq/CyberChef/releases/tag/v8.4.0
[8.3.0]: https://github.com/gchq/CyberChef/releases/tag/v8.3.0
[8.2.0]: https://github.com/gchq/CyberChef/releases/tag/v8.2.0
[8.1.0]: https://github.com/gchq/CyberChef/releases/tag/v8.1.0
[8.0.0]: https://github.com/gchq/CyberChef/releases/tag/v8.0.0
[7.0.0]: https://github.com/gchq/CyberChef/releases/tag/v7.0.0
[6.0.0]: https://github.com/gchq/CyberChef/releases/tag/v6.0.0
[5.0.0]: https://github.com/gchq/CyberChef/releases/tag/v5.0.0
[4.0.0]: https://github.com/gchq/CyberChef/commit/b1d73a725dc7ab9fb7eb789296efd2b7e4b08306

[@n1474335]: https://github.com/n1474335
[@d98762625]: https://github.com/d98762625
[@GCHQ77703]: https://github.com/GCHQ77703
[@artemisbot]: https://github.com/artemisbot
[@picapi]: https://github.com/picapi
[@Dachande663]: https://github.com/Dachande663
[@JustAnotherMark]: https://github.com/JustAnotherMark
[@sevzero]: https://github.com/sevzero
[@PenguinGeorge]: https://github.com/PenguinGeorge

[#95]: https://github.com/gchq/CyberChef/pull/299
[#173]: https://github.com/gchq/CyberChef/pull/173
[#224]: https://github.com/gchq/CyberChef/pull/224
[#239]: https://github.com/gchq/CyberChef/pull/239
[#248]: https://github.com/gchq/CyberChef/pull/248
[#255]: https://github.com/gchq/CyberChef/issues/255
[#281]: https://github.com/gchq/CyberChef/pull/281
[#284]: https://github.com/gchq/CyberChef/pull/284
[#294]: https://github.com/gchq/CyberChef/pull/294
[#296]: https://github.com/gchq/CyberChef/pull/296
[#298]: https://github.com/gchq/CyberChef/pull/298
[#311]: https://github.com/gchq/CyberChef/pull/311
[#325]: https://github.com/gchq/CyberChef/pull/325
[#338]: https://github.com/gchq/CyberChef/pull/338
[#340]: https://github.com/gchq/CyberChef/pull/340
[#344]: https://github.com/gchq/CyberChef/pull/344
