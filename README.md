# CyberChef

[![Build Status](https://travis-ci.org/gchq/CyberChef.svg?branch=master)](https://travis-ci.org/gchq/CyberChef)
[![dependencies Status](https://david-dm.org/gchq/CyberChef/status.svg)](https://david-dm.org/gchq/CyberChef)
[![npm](https://img.shields.io/npm/v/cyberchef.svg)](https://www.npmjs.com/package/cyberchef)
[![](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/gchq/CyberChef/blob/master/LICENSE)
[![Gitter](https://badges.gitter.im/gchq/CyberChef.svg)](https://gitter.im/gchq/CyberChef?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


#### *The Cyber Swiss Army Knife*

CyberChef is a simple, intuitive web app for carrying out all manner of "cyber" operations within a web browser. These operations include simple encoding like XOR or Base64, more complex encryption like AES, DES and Blowfish, creating binary and hexdumps, compression and decompression of data, calculating hashes and checksums, IPv6 and X.509 parsing, changing character encodings, and much more.

The tool is designed to enable both technical and non-technical analysts to manipulate data in complex ways without having to deal with complex tools or algorithms. It was conceived, designed, built and incrementally improved by an analyst in their 10% innovation time over several years.

## Live demo

CyberChef is still under active development. As a result, it shouldn't be considered a finished product. There is still testing and bug fixing to do, new features to be added and additional documentation to write. Please contribute!

Cryptographic operations in CyberChef should not be relied upon to provide security in any situation. No guarantee is offered for their correctness.

[A live demo can be found here][1] - have fun!


## How it works

There are four main areas in CyberChef:

 1. The **input** box in the top right, where you can paste, type or drag the text or file you want to operate on.
 2. The **output** box in the bottom right, where the outcome of your processing will be displayed.
 3. The **operations** list on the far left, where you can find all the operations that CyberChef is capable of in categorised lists, or by searching.
 4. The **recipe** area in the middle, where you can drag the operations that you want to use and specify arguments and options.

You can use as many operations as you like in simple or complex ways. Some examples are as follows:

 - [Decode a Base64-encoded string][2]
 - [Convert a date and time to a different time zone][3]
 - [Parse a Teredo IPv6 address][4]
 - [Convert data from a hexdump, then decompress][5]
 - [Decrypt and disassemble shellcode][6]
 - [Display multiple timestamps as full dates][7]
 - [Carry out different operations on data of different types][8]
 - [Use parts of the input as arguments to operations][9]
 - [Perform AES decryption, extracting the IV from the beginning of the cipher stream][10]
 - [Automagically detect several layers of nested encoding][12]


## Features

 - Drag and drop
     - Operations can be dragged in and out of the recipe list, or reorganised.
     - Files up to 2GB can be dragged over the input box to load them directly into the browser.
 - Auto Bake
     - Whenever you modify the input or the recipe, CyberChef will automatically "bake" for you and produce the output immediately.
     - This can be turned off and operated manually if it is affecting performance (if the input is very large, for instance).
 - Automated encoding detection
     - CyberChef uses [a number of techniques](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic) to attempt to automatically detect which encodings your data is under. If it finds a suitable operation which can make sense of your data, it displays the 'magic' icon in the Output field which you can click to decode your data.
 - Breakpoints
     - You can set breakpoints on any operation in your recipe to pause execution before running it.
     - You can also step through the recipe one operation at a time to see what the data looks like at each stage.
 - Save and load recipes
     - If you come up with an awesome recipe that you know you’ll want to use again, just click "Save recipe" and add it to your local storage. It'll be waiting for you next time you visit CyberChef.
     - You can also copy the URL, which includes your recipe and input, to easily share it with others.
 - Search
     - If you know the name of the operation you want or a word associated with it, start typing it into the search field and any matching operations will immediately be shown.
 - Highlighting
     - When you highlight text in the input or output, the offset and length values will be displayed and, if possible, the corresponding data will be highlighted in the output or input respectively (example: [highlight the word 'question' in the input to see where it appears in the output][11]).
 - Save to file and load from file
     - You can save the output to a file at any time or load a file by dragging and dropping it into the input field. Files up to around 2GB are supported (depending on your browser), however some operations may take a very long time to run over this much data.
 - CyberChef is entirely client-side
     - It should be noted that none of your recipe configuration or input (either text or files) is ever sent to the CyberChef web server - all processing is carried out within your browser, on your own computer.
     - Due to this feature, CyberChef can be compiled into a single HTML file. You can download this file and drop it into a virtual machine, share it with other people, or use it independently on your local machine.


## Browser support

CyberChef is built to support

 - Google Chrome 50+
 - Mozilla Firefox 38+


## Node.js support

CyberChef is built to fully support Node.js `v10` and partially supports `v12`. Named imports using a deep import specifier does not work in `v12`. For more information, see the Node API page in the project [wiki pages](https://github.com/gchq/CyberChef/wiki)


## Contributing

Contributing a new operation to CyberChef is super easy! There is a quickstart script which will walk you through the process. If you can write basic JavaScript, you can write a CyberChef operation.

An installation walkthrough, how-to guides for adding new operations and themes, descriptions of the repository structure, available data types and coding conventions can all be found in the project [wiki pages](https://github.com/gchq/CyberChef/wiki).

 - Push your changes to your fork.
 - Submit a pull request. If you are doing this for the first time, you will be prompted to sign the [GCHQ Contributor Licence Agreement](https://cla-assistant.io/gchq/CyberChef) via the CLA assistant on the pull request. This will also ask whether you are happy for GCHQ to contact you about a token of thanks for your contribution, or about job opportunities at GCHQ.


## Licencing

CyberChef is released under the [Apache 2.0 Licence](https://www.apache.org/licenses/LICENSE-2.0) and is covered by [Crown Copyright](https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/copyright-and-re-use/crown-copyright/).


  [1]: https://gchq.github.io/CyberChef
  [2]: https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true)&input=VTI4Z2JHOXVaeUJoYm1RZ2RHaGhibXR6SUdadmNpQmhiR3dnZEdobElHWnBjMmd1
  [3]: https://gchq.github.io/CyberChef/#recipe=Translate_DateTime_Format('Standard%20date%20and%20time','DD/MM/YYYY%20HH:mm:ss','UTC','dddd%20Do%20MMMM%20YYYY%20HH:mm:ss%20Z%20z','Australia/Queensland')&input=MTUvMDYvMjAxNSAyMDo0NTowMA
  [4]: https://gchq.github.io/CyberChef/#recipe=Parse_IPv6_address()&input=MjAwMTowMDAwOjQxMzY6ZTM3ODo4MDAwOjYzYmY6M2ZmZjpmZGQy
  [5]: https://gchq.github.io/CyberChef/#recipe=From_Hexdump()Gunzip()&input=MDAwMDAwMDAgIDFmIDhiIDA4IDAwIDEyIGJjIGYzIDU3IDAwIGZmIDBkIGM3IGMxIDA5IDAwIDIwICB8Li4uLi6881cu/y7HwS4uIHwKMDAwMDAwMTAgIDA4IDA1IGQwIDU1IGZlIDA0IDJkIGQzIDA0IDFmIGNhIDhjIDQ0IDIxIDViIGZmICB8Li7QVf4uLdMuLsouRCFb/3wKMDAwMDAwMjAgIDYwIGM3IGQ3IDAzIDE2IGJlIDQwIDFmIDc4IDRhIDNmIDA5IDg5IDBiIDlhIDdkICB8YMfXLi6%2BQC54Sj8uLi4ufXwKMDAwMDAwMzAgIDRlIGM4IDRlIDZkIDA1IDFlIDAxIDhiIDRjIDI0IDAwIDAwIDAwICAgICAgICAgICB8TshObS4uLi5MJC4uLnw
  [6]: https://gchq.github.io/CyberChef/#recipe=RC4(%7B'option':'UTF8','string':'secret'%7D,'Hex','Hex')Disassemble_x86('64','Full%20x86%20architecture',16,0,true,true)&input=MjFkZGQyNTQwMTYwZWU2NWZlMDc3NzEwM2YyYTM5ZmJlNWJjYjZhYTBhYWJkNDE0ZjkwYzZjYWY1MzEyNzU0YWY3NzRiNzZiM2JiY2QxOTNjYjNkZGZkYmM1YTI2NTMzYTY4NmI1OWI4ZmVkNGQzODBkNDc0NDIwMWFlYzIwNDA1MDcxMzhlMmZlMmIzOTUwNDQ2ZGIzMWQyYmM2MjliZTRkM2YyZWIwMDQzYzI5M2Q3YTVkMjk2MmMwMGZlNmRhMzAwNzJkOGM1YTZiNGZlN2Q4NTlhMDQwZWVhZjI5OTczMzYzMDJmNWEwZWMxOQ
  [7]: https://gchq.github.io/CyberChef/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)From_UNIX_Timestamp('Seconds%20(s)')&input=OTc4MzQ2ODAwCjEwMTI2NTEyMDAKMTA0NjY5NjQwMAoxMDgxMDg3MjAwCjExMTUzMDUyMDAKMTE0OTYwOTYwMA
  [8]: https://gchq.github.io/CyberChef/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)Conditional_Jump('1',false,'base64',10)To_Hex('Space')Return()Label('base64')To_Base64('A-Za-z0-9%2B/%3D')&input=U29tZSBkYXRhIHdpdGggYSAxIGluIGl0ClNvbWUgZGF0YSB3aXRoIGEgMiBpbiBpdA
  [9]: https://gchq.github.io/CyberChef/#recipe=Register('key%3D(%5B%5C%5Cda-f%5D*)',true,false)Find_/_Replace(%7B'option':'Regex','string':'.*data%3D(.*)'%7D,'$1',true,false,true)RC4(%7B'option':'Hex','string':'$R0'%7D,'Hex','Latin1')&input=aHR0cDovL21hbHdhcmV6LmJpei9iZWFjb24ucGhwP2tleT0wZTkzMmE1YyZkYXRhPThkYjdkNWViZTM4NjYzYTU0ZWNiYjMzNGUzZGIxMQ
  [10]: https://gchq.github.io/CyberChef/#recipe=Register('(.%7B32%7D)',true,false)Drop_bytes(0,32,false)AES_Decrypt(%7B'option':'Hex','string':'1748e7179bd56570d51fa4ba287cc3e5'%7D,%7B'option':'Hex','string':'$R0'%7D,'CTR','Hex','Raw',%7B'option':'Hex','string':''%7D)&input=NTFlMjAxZDQ2MzY5OGVmNWY3MTdmNzFmNWI0NzEyYWYyMGJlNjc0YjNiZmY1M2QzODU0NjM5NmVlNjFkYWFjNDkwOGUzMTljYTNmY2Y3MDg5YmZiNmIzOGVhOTllNzgxZDI2ZTU3N2JhOWRkNmYzMTFhMzk0MjBiODk3OGU5MzAxNGIwNDJkNDQ3MjZjYWVkZjU0MzZlYWY2NTI0MjljMGRmOTRiNTIxNjc2YzdjMmNlODEyMDk3YzI3NzI3M2M3YzcyY2Q4OWFlYzhkOWZiNGEyNzU4NmNjZjZhYTBhZWUyMjRjMzRiYTNiZmRmN2FlYjFkZGQ0Nzc2MjJiOTFlNzJjOWU3MDlhYjYwZjhkYWY3MzFlYzBjYzg1Y2UwZjc0NmZmMTU1NGE1YTNlYzI5MWNhNDBmOWU2MjlhODcyNTkyZDk4OGZkZDgzNDUzNGFiYTc5YzFhZDE2NzY3NjlhN2MwMTBiZjA0NzM5ZWNkYjY1ZDk1MzAyMzcxZDYyOWQ5ZTM3ZTdiNGEzNjFkYTQ2OGYxZWQ1MzU4OTIyZDJlYTc1MmRkMTFjMzY2ZjMwMTdiMTRhYTAxMWQyYWYwM2M0NGY5NTU3OTA5OGExNWUzY2Y5YjQ0ODZmOGZmZTljMjM5ZjM0ZGU3MTUxZjZjYTY1MDBmZTRiODUwYzNmMWMwMmU4MDFjYWYzYTI0NDY0NjE0ZTQyODAxNjE1YjhmZmFhMDdhYzgyNTE0OTNmZmRhN2RlNWRkZjMzNjg4ODBjMmI5NWIwMzBmNDFmOGYxNTA2NmFkZDA3MWE2NmNmNjBlNWY0NmYzYTIzMGQzOTdiNjUyOTYzYTIxYTUzZg
  [11]: https://gchq.github.io/CyberChef/#recipe=XOR(%7B'option':'Hex','string':'3a'%7D,'Standard',false)To_Hexdump(16,false,false)&input=VGhlIGFuc3dlciB0byB0aGUgdWx0aW1hdGUgcXVlc3Rpb24gb2YgbGlmZSwgdGhlIFVuaXZlcnNlLCBhbmQgZXZlcnl0aGluZyBpcyA0Mi4
  [12]: https://gchq.github.io/CyberChef/#recipe=Magic(3,false,false)&input=V1VhZ3dzaWFlNm1QOGdOdENDTFVGcENwQ0IyNlJtQkRvREQ4UGFjZEFtekF6QlZqa0syUXN0RlhhS2hwQzZpVVM3UkhxWHJKdEZpc29SU2dvSjR3aGptMWFybTg2NHFhTnE0UmNmVW1MSHJjc0FhWmM1VFhDWWlmTmRnUzgzZ0RlZWpHWDQ2Z2FpTXl1QlY2RXNrSHQxc2NnSjg4eDJ0TlNvdFFEd2JHWTFtbUNvYjJBUkdGdkNLWU5xaU45aXBNcTFaVTFtZ2tkYk51R2NiNzZhUnRZV2hDR1VjOGc5M1VKdWRoYjhodHNoZVpud1RwZ3FoeDgzU1ZKU1pYTVhVakpUMnptcEM3dVhXdHVtcW9rYmRTaTg4WXRrV0RBYzFUb291aDJvSDRENGRkbU5LSldVRHBNd21uZ1VtSzE0eHdtb21jY1BRRTloTTE3MkFQblNxd3hkS1ExNzJSa2NBc3lzbm1qNWdHdFJtVk5OaDJzMzU5d3I2bVMyUVJQ
  
  
  
  
  Apache License
                           Version 2.0, January 2004
                        https://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2019 Rolando Gopez Lacuata

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

  
