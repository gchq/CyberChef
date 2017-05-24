# CyberChef

####*The Cyber Swiss Army Knife*

CyberChef is a simple, intuitive web app for carrying out all manner of "cyber" operations within a web browser. These operations include creating hexdumps, simple encoding like XOR or Base64, more complex encryption like AES, DES and Blowfish, data compression and decompression, calculating hashes and checksums, IPv6 and X.509 parsing, and much more.

The tool is designed to enable both technical and non-technical analysts to manipulate data in complex ways without having to deal with complex tools or algorithms. It was conceived, designed, built and incrementally improved by an analyst in their 10% innovation time over several years. Every effort has been made to structure the code in a readable and extendable format, however it should be noted that the analyst is not a professional developer and the code has not been peer-reviewed for compliance with a formal specification.

## Live demo

CyberChef is still under active development. As a result, it shouldn't be considered a finished product. There is still testing and bug fixing to do, new features to be added and additional documentation to write. Please contribute!

Cryptographic operations in CyberChef should not be relied upon to provide security in any situation. No guarantee is offered for their correctness.

[A live demo can be found here][1] - have fun!
Note: Use Chrome or Firefox, see the Browser Support section below for details.


## How it works

There are four main areas in CyberChef:

 1. The **input** box in the top right, where you can paste, type or drag the data you want to operate on.
 2. The **output** box in the bottom right, where the outcome of the specified processing will be displayed.
 3. The **operations** list on the far left, where you can find all the operations that CyberChef is capable of in categorised lists, or by searching.
 4. The **recipe** area in the middle, where you drag the operations that you want to use and specify arguments and options.

You can use as many operations as you like in simple or complex ways. Some examples are as follows:

 - [Decode a Base64-encoded string][2]
 - [Convert a date and time to a different time zone][3]
 - [Parse a Teredo IPv6 address][4]
 - [Convert data from a hexdump, then decompress][5]
 - [Display multiple timestamps as full dates][6]
 - [Carry out different operations on data of different types][7]


## Features

 - Drag and drop
     - Operations can be dragged in and out of the recipe list, or reorganised.
     - Files can be dragged over the input box to load them directly.
 - Auto Bake
     - Whenever you modify the input or the recipe, CyberChef will automatically “bake” for you and produce the output immediately.
     - This can be turned off and operated manually if it is affecting performance (if the input is very large, for instance).
     - If any bake takes longer than 200 milliseconds, auto bake will be switched off automatically to prevent further performance issues.
 - Breakpoints
     - You can set breakpoints on any operation in your recipe to pause execution before running it.
     - You can also step through the recipe one operation at a time to see what the data looks like at each stage.
 - Save and load recipes
     - If you come up with an awesome recipe that you know you’ll want to use again, just click save and add it to your local storage. It'll be waiting for you next time you visit CyberChef.
     - You can also copy a URL which includes your recipe and input which can be shared with others.
 - Search
     - If you know the name of the operation you want or a word associated with it, start typing it into the search field and any matching operations will immediately be shown.
 - Highlighting
     - When you highlight text in the input or output, the offset and length values will be displayed and, if possible, the corresponding data will be highlighted in the output or input respectively (example: [highlight the word 'question' in the input to see where it appears in the output][8]).
 - Save to file and load from file
     - You can save the output to a file at any time or load a file by dragging and dropping it into the input field (note that files larger than about 500kb may cause your browser to hang or even crash due to the way that browsers handle large amounts of textual data).
 - CyberChef is entirely client-side
     - It should be noted that none of your input or recipe configuration is ever sent to the CyberChef web server - all processing is carried out within your browser, on your own computer.
     - Due to this feature, CyberChef can be compiled into a single HTML file. You can download this file and drop it into a virtual machine, share it with other people, or use it independently on your desktop.


## Browser support

CyberChef works well in modern versions of Google Chrome and Mozilla Firefox.

To aid in the efficient development of new features and operations, there has been no attempt to maintain support for any version of Microsoft Internet Explorer.

Microsoft Edge is currently unsupported, but if anyone would like to contribute compatibility fixes, they would be appreciated.


## Contributing

An installation walkthrough, how-to guides for adding new operations, descriptions of the repository structure, available data types and coding conventions can all be found in the project [wiki pages](https://github.com/gchq/CyberChef/wiki).

 - Sign the [GCHQ Contributor Licence Agreement](https://github.com/gchq/Gaffer/wiki/GCHQ-OSS-Contributor-License-Agreement-V1.0)
 - Push your changes to your fork.
 - Submit a pull request.


  [1]: https://gchq.github.io/CyberChef
  [2]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22From%20Base64%22%2C%22args%22%3A%5B%22A-Za-z0-9%2B%2F%3D%22%2Ctrue%5D%7D%5D&input=VTI4Z2JHOXVaeUJoYm1RZ2RHaGhibXR6SUdadmNpQmhiR3dnZEdobElHWnBjMmd1
  [3]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22Translate%20DateTime%20Format%22%2C%22args%22%3A%5B%22Standard%20date%20and%20time%22%2C%22DD%2FMM%2FYYYY%20HH%3Amm%3Ass%22%2C%22UTC%22%2C%22dddd%20Do%20MMMM%20YYYY%20HH%3Amm%3Ass%20Z%20z%22%2C%22Australia%2FQueensland%22%5D%7D%5D&input=MTUvMDYvMjAxNSAyMDo0NTowMA
  [4]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22Parse%20IPv6%20address%22%2C%22args%22%3A%5B%5D%7D%5D&input=MjAwMTowMDAwOjQxMzY6ZTM3ODo4MDAwOjYzYmY6M2ZmZjpmZGQy
  [5]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22From%20Hexdump%22%2C%22args%22%3A%5B%5D%7D%2C%7B%22op%22%3A%22Gunzip%22%2C%22args%22%3A%5B%5D%7D%5D&input=MDAwMDAwMDAgIDFmIDhiIDA4IDAwIDEyIGJjIGYzIDU3IDAwIGZmIDBkIGM3IGMxIDA5IDAwIDIwICB8Li4uLi6881cu%2Fy7HwS4uIHwKMDAwMDAwMTAgIDA4IDA1IGQwIDU1IGZlIDA0IDJkIGQzIDA0IDFmIGNhIDhjIDQ0IDIxIDViIGZmICB8Li7QVf4uLdMuLsouRCFb%2F3wKMDAwMDAwMjAgIDYwIGM3IGQ3IDAzIDE2IGJlIDQwIDFmIDc4IDRhIDNmIDA5IDg5IDBiIDlhIDdkICB8YMfXLi6%2BQC54Sj8uLi4ufXwKMDAwMDAwMzAgIDRlIGM4IDRlIDZkIDA1IDFlIDAxIDhiIDRjIDI0IDAwIDAwIDAwICAgICAgICAgICB8TshObS4uLi5MJC4uLnw
  [6]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22Fork%22%2C%22args%22%3A%5B%22%5C%5Cn%22%2C%22%5C%5Cn%22%5D%7D%2C%7B%22op%22%3A%22From%20UNIX%20Timestamp%22%2C%22args%22%3A%5B%22Seconds%20(s)%22%5D%7D%5D&input=OTc4MzQ2ODAwCjEwMTI2NTEyMDAKMTA0NjY5NjQwMAoxMDgxMDg3MjAwCjExMTUzMDUyMDAKMTE0OTYwOTYwMA
  [7]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22Fork%22%2C%22args%22%3A%5B%22%5C%5Cn%22%2C%22%5C%5Cn%22%5D%7D%2C%7B%22op%22%3A%22Conditional%20Jump%22%2C%22args%22%3A%5B%221%22%2C%222%22%2C%2210%22%5D%7D%2C%7B%22op%22%3A%22To%20Hex%22%2C%22args%22%3A%5B%22Space%22%5D%7D%2C%7B%22op%22%3A%22Return%22%2C%22args%22%3A%5B%5D%7D%2C%7B%22op%22%3A%22To%20Base64%22%2C%22args%22%3A%5B%22A-Za-z0-9%2B%2F%3D%22%5D%7D%5D&input=U29tZSBkYXRhIHdpdGggYSAxIGluIGl0ClNvbWUgZGF0YSB3aXRoIGEgMiBpbiBpdA
  [8]: https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22XOR%22%2C%22args%22%3A%5B%7B%22option%22%3A%22Hex%22%2C%22string%22%3A%223a%22%7D%2Cfalse%2Cfalse%5D%7D%2C%7B%22op%22%3A%22To%20Hexdump%22%2C%22args%22%3A%5B%2216%22%2Cfalse%2Cfalse%5D%7D%5D&input=VGhlIGFuc3dlciB0byB0aGUgdWx0aW1hdGUgcXVlc3Rpb24gb2YgbGlmZSwgdGhlIFVuaXZlcnNlLCBhbmQgZXZlcnl0aGluZyBpcyA0Mi4