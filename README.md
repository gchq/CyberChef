# CyberChef - Payments
This fork extends **CyberChef** with a focused set of payment cryptography operations intended for engineering, debugging, and interoperability work in regulated payment environments. The upstream Cyberchef is automatically merged weekly to track the orign. 

[![](https://github.com/J8k3/CyberChef/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/gchq/CyberChef/actions?query=workflow%3A%22Master+Build%2C+Test+%26+Deploy%22)
[![](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/gchq/CyberChef/blob/master/LICENSE)

CyberChef is a simple, intuitive web app for carrying out all manner of "cyber" operations within a web browser. These operations include simple encoding like XOR and Base64, more complex encryption like AES, DES and Blowfish, creating binary and hexdumps, compression and decompression of data, calculating hashes and checksums, IPv6 and X.509 parsing, changing character encodings, and much more.

The tool is designed to enable both technical and non-technical analysts to manipulate data in complex ways without having to deal with complex tools or algorithms. It was conceived, designed, built and incrementally improved by an analyst in their 10% innovation time over several years.

### Scope
The payment extensions are designed to help inspect, parse, validate, and construct common payment-industry cryptographic structures without requiring access to live HSMs or production systems.

They are also intended to support software emulation of common HSM-style payment workflows for development, QA, interoperability, and integration testing.

Current coverage includes:
- TR-31 key block parsing and TR-34 B9 envelope inspection
- Key metadata inspection and structural validation
- DUKPT TDES key derivation (ANSI X9.24-1, 10-byte KSN, IPEK-based)
- DUKPT AES key derivation (ANSI X9.24-3, 12-byte KSN, IK-based, AES-128)
- PIN block format parsing, construction, and translation — including encrypted PIN block re-keying between zone keys (ISO 9564 formats 0, 1, 3)
- Payment-specific MAC and KCV utilities (HMAC, AES-CMAC, TDES-CMAC, ISO 9797-1, AS2805, DUKPT variants)
- EMV ARQC/ARPC generation and verification
- EMV issuer-script MAC generation and verification
- Card validation data (CVV/CVC, CVV2/CVC2, iCVV) generation and verification
- IBM 3624 PIN offset and VISA PVV issuer-verification helpers
- Test PAN generation and PAN parsing across major card networks
- Deterministic, test-vector-driven transformations suitable for offline analysis
- TR-31 key block decryption with provided KBPKs

### Non-goals
These extensions are not intended to:
- Facilitate fraud, card data misuse, or PIN compromise
- Replace certified HSMs or production cryptographic controls
- Claim certification, tamper-resistance, or compliance equivalence with production HSM deployments

All operations are designed to be explicit, inspectable, and composable, consistent with CyberChef’s philosophy.

### Organization
Custom operations live under:

src/core/operations/

They appear in the CyberChef UI under the **Payments** category.

Recipe starter docs:
- [PAYMENT_RECIPES.md](PAYMENT_RECIPES.md)

### Payment recipe examples

Payment-specific recipe chains and standalone operations, pre-loaded at [cyberchef.jacobmarks.com][1]:

 - [VISA PVV: generate PVV from clear PIN][p01]
 - [VISA PVV: generate then verify (full chain)][p02]
 - [IBM 3624: generate PIN offset][p03]
 - [IBM 3624: generate then verify (full chain)][p04]
 - [EMV: generate ARQC][p05]
 - [EMV: generate then verify ARQC (full chain)][p06]
 - [EMV: generate ARPC issuer response][p07]
 - [EMV: generate issuer-script MAC][p08]
 - [EMV: verify issuer-script MAC][p09]
 - [Payment MAC: generate AES-CMAC][p10]
 - [Payment MAC: verify AES-CMAC][p11]
 - [DUKPT TDES: derive IPEK from BDK][p12]
 - [DUKPT TDES: derive PIN session key][p13]
 - [PIN Block: build ISO Format 0 then parse (full chain)][p14]
 - [TR-31 key block: parse and inspect header fields][p15]
 - [HSM: parse Thales payShield command][p16]
 - [HSM: parse Futurex Excrypt command][p17]
 - [Payment KCV: compute AES-CMAC key check value][p18]
 - [PAN Generate: Visa curated test card number][p20]
 - [PAN Parse: classify a card number by network][p21]
 - [Card validation data: generate CVV2][p22]
 - [Card validation data: verify CVV2][p23]
 - [PIN Block Translate Encrypted: re-key between ZPKs (Format 0)][p24]
 - [PIN Block Translate Encrypted: re-key with JSON inspection output][p25]

## Live demo

CyberChef Payments will always be considered an unfinshed product as it emulates functionality implemetned by Thales, Futurex, and Utimaco HSMs without a formal way to verify all edge cases for implementation specifics. The best validation we can do, and it's a pretty good option if I do say so myself, is known value testing against AWS Payment Cryptograpy and it's Futurex backed HSM fleet.

Cryptographic operations in CyberChef should not be relied upon to provide security in any situation. No guarantee is offered for their correctness.

[A live demo can be found at cyberchef.jacobmarks.com][1] - have fun!

## Developing/Running Locally with Docker

**Prerequisites**

- [Docker](https://www.docker.com/products/docker-desktop/)
  - Docker Desktop must be open and running on your machine

#### Option 1: Build the Docker Image Yourself

1. Build the docker image
```bash
docker build --tag cyberchef --ulimit nofile=10000 .
```
2. Run the docker container
```bash
docker run -it -p 8080:8080 cyberchef
```
3. Navigate to `http://localhost:8080` in your browser

#### Option 2: Use the pre-built Docker Image

If you prefer to skip the build process, you can use the pre-built image

```bash
docker run -it -p 8080:8080 ghcr.io/gchq/cyberchef:latest
```

Just like before, navigate to `http://localhost:8080` in your browser.

This image is built and published through our [GitHub Workflows](.github/workflows/releases.yml)

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
     - CyberChef uses [a number of techniques](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic) to attempt to automatically detect which encodings your data is under. If it finds a suitable operation that make sense of your data, it displays the 'magic' icon in the Output field which you can click to decode your data.
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
     - You can save the output to a file at any time or load a file by dragging and dropping it into the input field. Files up to around 2GB are supported (depending on your browser), however, some operations may take a very long time to run over this much data.
 - CyberChef is entirely client-side
     - It should be noted that none of your recipe configuration or input (either text or files) is ever sent to the CyberChef web server - all processing is carried out within your browser, on your own computer.
     - Due to this feature, CyberChef can be downloaded and run locally. You can use the link in the top left corner of the app to download a full copy of CyberChef and drop it into a virtual machine, share it with other people, or host it in a closed network.


## Deep linking

By manipulating CyberChef's URL hash, you can change the initial settings with which the page opens.
The format is `https://cyberchef.jacobmarks.com/#recipe=Operation()&input=...`

Supported arguments are `recipe`, `input` (encoded in Base64), and `theme`.


## Browser support

CyberChef is built to support

 - Google Chrome 50+
 - Mozilla Firefox 38+


## Node.js support

CyberChef is built to fully support Node.js `v24`. For more information, see the ["Node API" wiki page](https://github.com/gchq/CyberChef/wiki/Node-API)


## Contributing

Contributing a new operation to CyberChef is super easy! The quickstart script will walk you through the process. If you can write basic JavaScript, you can write a CyberChef operation.

An installation walkthrough, how-to guides for adding new operations and themes, descriptions of the repository structure, available data types and coding conventions can all be found in the ["Contributing" wiki page](https://github.com/gchq/CyberChef/wiki/Contributing).

 - Push your changes to your fork.
 - Submit a pull request. If you are doing this for the first time, you will be prompted to sign the [GCHQ Contributor Licence Agreement](https://cla-assistant.io/gchq/CyberChef) via the CLA assistant on the pull request. This will also ask whether you are happy for GCHQ to contact you about a token of thanks for your contribution, or about job opportunities at GCHQ.


## Licencing

CyberChef is released under the [Apache 2.0 Licence](https://www.apache.org/licenses/LICENSE-2.0) and is covered by [Crown Copyright](https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/).


  [1]: https://cyberchef.jacobmarks.com
  [2]: https://cyberchef.jacobmarks.com/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true)&input=VTI4Z2JHOXVaeUJoYm1RZ2RHaGhibXR6SUdadmNpQmhiR3dnZEdobElHWnBjMmd1
  [3]: https://cyberchef.jacobmarks.com/#recipe=Translate_DateTime_Format('Standard%20date%20and%20time','DD/MM/YYYY%20HH:mm:ss','UTC','dddd%20Do%20MMMM%20YYYY%20HH:mm:ss%20Z%20z','Australia/Queensland')&input=MTUvMDYvMjAxNSAyMDo0NTowMA
  [4]: https://cyberchef.jacobmarks.com/#recipe=Parse_IPv6_address()&input=MjAwMTowMDAwOjQxMzY6ZTM3ODo4MDAwOjYzYmY6M2ZmZjpmZGQy
  [5]: https://cyberchef.jacobmarks.com/#recipe=From_Hexdump()Gunzip()&input=MDAwMDAwMDAgIDFmIDhiIDA4IDAwIDEyIGJjIGYzIDU3IDAwIGZmIDBkIGM3IGMxIDA5IDAwIDIwICB8Li4uLi6881cu/y7HwS4uIHwKMDAwMDAwMTAgIDA4IDA1IGQwIDU1IGZlIDA0IDJkIGQzIDA0IDFmIGNhIDhjIDQ0IDIxIDViIGZmICB8Li7QVf4uLdMuLsouRCFb/3wKMDAwMDAwMjAgIDYwIGM3IGQ3IDAzIDE2IGJlIDQwIDFmIDc4IDRhIDNmIDA5IDg5IDBiIDlhIDdkICB8YMfXLi6%2BQC54Sj8uLi4ufXwKMDAwMDAwMzAgIDRlIGM4IDRlIDZkIDA1IDFlIDAxIDhiIDRjIDI0IDAwIDAwIDAwICAgICAgICAgICB8TshObS4uLi5MJC4uLnw
  [6]: https://cyberchef.jacobmarks.com/#recipe=RC4(%7B'option':'UTF8','string':'secret'%7D,'Hex','Hex')Disassemble_x86('64','Full%20x86%20architecture',16,0,true,true)&input=MjFkZGQyNTQwMTYwZWU2NWZlMDc3NzEwM2YyYTM5ZmJlNWJjYjZhYTBhYWJkNDE0ZjkwYzZjYWY1MzEyNzU0YWY3NzRiNzZiM2JiY2QxOTNjYjNkZGZkYmM1YTI2NTMzYTY4NmI1OWI4ZmVkNGQzODBkNDc0NDIwMWFlYzIwNDA1MDcxMzhlMmZlMmIzOTUwNDQ2ZGIzMWQyYmM2MjliZTRkM2YyZWIwMDQzYzI5M2Q3YTVkMjk2MmMwMGZlNmRhMzAwNzJkOGM1YTZiNGZlN2Q4NTlhMDQwZWVhZjI5OTczMzYzMDJmNWEwZWMxOQ
  [7]: https://cyberchef.jacobmarks.com/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)From_UNIX_Timestamp('Seconds%20(s)')&input=OTc4MzQ2ODAwCjEwMTI2NTEyMDAKMTA0NjY5NjQwMAoxMDgxMDg3MjAwCjExMTUzMDUyMDAKMTE0OTYwOTYwMA
  [8]: https://cyberchef.jacobmarks.com/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)Conditional_Jump('1',false,'base64',10)To_Hex('Space')Return()Label('base64')To_Base64('A-Za-z0-9%2B/%3D')&input=U29tZSBkYXRhIHdpdGggYSAxIGluIGl0ClNvbWUgZGF0YSB3aXRoIGEgMiBpbiBpdA
  [9]: https://cyberchef.jacobmarks.com/#recipe=Register('key%3D(%5B%5C%5Cda-f%5D*)',true,false)Find_/_Replace(%7B'option':'Regex','string':'.*data%3D(.*)'%7D,'$1',true,false,true)RC4(%7B'option':'Hex','string':'$R0'%7D,'Hex','Latin1')&input=aHR0cDovL21hbHdhcmV6LmJpei9iZWFjb24ucGhwP2tleT0wZTkzMmE1YyZkYXRhPThkYjdkNWViZTM4NjYzYTU0ZWNiYjMzNGUzZGIxMQ
  [10]: https://cyberchef.jacobmarks.com/#recipe=Register('(.%7B32%7D)',true,false)Drop_bytes(0,32,false)AES_Decrypt(%7B'option':'Hex','string':'1748e7179bd56570d51fa4ba287cc3e5'%7D,%7B'option':'Hex','string':'$R0'%7D,'CTR','Hex','Raw',%7B'option':'Hex','string':''%7D)&input=NTFlMjAxZDQ2MzY5OGVmNWY3MTdmNzFmNWI0NzEyYWYyMGJlNjc0YjNiZmY1M2QzODU0NjM5NmVlNjFkYWFjNDkwOGUzMTljYTNmY2Y3MDg5YmZiNmIzOGVhOTllNzgxZDI2ZTU3N2JhOWRkNmYzMTFhMzk0MjBiODk3OGU5MzAxNGIwNDJkNDQ3MjZjYWVkZjU0MzZlYWY2NTI0MjljMGRmOTRiNTIxNjc2YzdjMmNlODEyMDk3YzI3NzI3M2M3YzcyY2Q4OWFlYzhkOWZiNGEyNzU4NmNjZjZhYTBhZWUyMjRjMzRiYTNiZmRmN2FlYjFkZGQ0Nzc2MjJiOTFlNzJjOWU3MDlhYjYwZjhkYWY3MzFlYzBjYzg1Y2UwZjc0NmZmMTU1NGE1YTNlYzI5MWNhNDBmOWU2MjlhODcyNTkyZDk4OGZkZDgzNDUzNGFiYTc5YzFhZDE2NzY3NjlhN2MwMTBiZjA0NzM5ZWNkYjY1ZDk1MzAyMzcxZDYyOWQ5ZTM3ZTdiNGEzNjFkYTQ2OGYxZWQ1MzU4OTIyZDJlYTc1MmRkMTFjMzY2ZjMwMTdiMTRhYTAxMWQyYWYwM2M0NGY5NTU3OTA5OGExNWUzY2Y5YjQ0ODZmOGZmZTljMjM5ZjM0ZGU3MTUxZjZjYTY1MDBmZTRiODUwYzNmMWMwMmU4MDFjYWYzYTI0NDY0NjE0ZTQyODAxNjE1YjhmZmFhMDdhYzgyNTE0OTNmZmRhN2RlNWRkZjMzNjg4ODBjMmI5NWIwMzBmNDFmOGYxNTA2NmFkZDA3MWE2NmNmNjBlNWY0NmYzYTIzMGQzOTdiNjUyOTYzYTIxYTUzZg
  [11]: https://cyberchef.jacobmarks.com/#recipe=XOR(%7B'option':'Hex','string':'3a'%7D,'Standard',false)To_Hexdump(16,false,false)&input=VGhlIGFuc3dlciB0byB0aGUgdWx0aW1hdGUgcXVlc3Rpb24gb2YgbGlmZSwgdGhlIFVuaXZlcnNlLCBhbmQgZXZlcnl0aGluZyBpcyA0Mi4
  [12]: https://cyberchef.jacobmarks.com/#recipe=Magic(3,false,false)&input=V1VhZ3dzaWFlNm1QOGdOdENDTFVGcENwQ0IyNlJtQkRvREQ4UGFjZEFtekF6QlZqa0syUXN0RlhhS2hwQzZpVVM3UkhxWHJKdEZpc29SU2dvSjR3aGptMWFybTg2NHFhTnE0UmNmVW1MSHJjc0FhWmM1VFhDWWlmTmRnUzgzZ0RlZWpHWDQ2Z2FpTXl1QlY2RXNrSHQxc2NnSjg4eDJ0TlNvdFFEd2JHWTFtbUNvYjJBUkdGdkNLWU5xaU45aXBNcTFaVTFtZ2tkYk51R2NiNzZhUnRZV2hDR1VjOGc5M1VKdWRoYjhodHNoZVpud1RwZ3FoeDgzU1ZKU1pYTVhVakpUMnptcEM3dVhXdHVtcW9rYmRTaTg4WXRrV0RBYzFUb291aDJvSDRENGRkbU5LSldVRHBNd21uZ1VtSzE0eHdtb21jY1BRRTloTTE3MkFQblNxd3hkS1ExNzJSa2NBc3lzbm1qNWdHdFJtVk5OaDJzMzU5d3I2bVMyUVJQ
  [p01]: https://cyberchef.jacobmarks.com/#recipe=PIN_Generate(4,'PIN%20digits','')VISA_PVV_Generate('0123456789ABCDEFFEDCBA9876543210','5432101234567890',1,true)
  [p02]: https://cyberchef.jacobmarks.com/#recipe=PIN_Generate(4,'PIN%20digits','')VISA_PVV_Generate('0123456789ABCDEFFEDCBA9876543210','5432101234567890',1,false)VISA_PVV_Verify('0123456789ABCDEFFEDCBA9876543210','5432101234567890',1,'1234',true)
  [p03]: https://cyberchef.jacobmarks.com/#recipe=PIN_Generate(4,'PIN%20digits','')PIN_IBM_3624_Offset_Generate('0123456789ABCDEFFEDCBA9876543210','0123456789012345','5432101234567890','F',false)
  [p04]: https://cyberchef.jacobmarks.com/#recipe=PIN_Generate(4,'PIN%20digits','')PIN_IBM_3624_Offset_Generate('0123456789ABCDEFFEDCBA9876543210','0123456789012345','5432101234567890','F',false)PIN_IBM_3624_Verify('0123456789ABCDEFFEDCBA9876543210','0123456789012345','5432101234567890','F','1234',true)
  [p05]: https://cyberchef.jacobmarks.com/#recipe=EMV_Generate_ARQC('00112233445566778899AABBCCDDEEFF',8,false)&input=MDAwMTAyMDMwNDA1MDYwNzA4MDkwQTBCMEMwRDBFMEY
  [p06]: https://cyberchef.jacobmarks.com/#recipe=EMV_Generate_ARQC('00112233445566778899AABBCCDDEEFF',8,false)EMV_Verify_ARQC('00112233445566778899AABBCCDDEEFF',8,'000102030405060708090A0B0C0D0E0F',true)&input=MDAwMTAyMDMwNDA1MDYwNzA4MDkwQTBCMEMwRDBFMEY
  [p07]: https://cyberchef.jacobmarks.com/#recipe=EMV_Generate_ARPC('00112233445566778899AABBCCDDEEFF',8,false)&input=MTEyMjMzNDQ1NTY2Nzc4ODk5MDBBQUJCQ0NEREVFRkY
  [p08]: https://cyberchef.jacobmarks.com/#recipe=EMV_Generate_MAC('0123456789ABCDEFFEDCBA9876543210','Method%202',8,false)&input=ODQyNDAwMDAwODk5OUU1N0ZEMEY0N0NBQ0UwMDA3
  [p09]: https://cyberchef.jacobmarks.com/#recipe=EMV_Verify_MAC('0123456789ABCDEFFEDCBA9876543210','22CB48394DFD1977','Method%202',true)&input=ODQyNDAwMDAwODk5OUU1N0ZEMEY0N0NBQ0UwMDA3
  [p10]: https://cyberchef.jacobmarks.com/#recipe=MAC_Generate('Hex','AES-CMAC','00112233445566778899AABBCCDDEEFF','Hex','','Method%201',8,false)&input=MTEyMjMzNDQ1NTY2Nzc4OA
  [p11]: https://cyberchef.jacobmarks.com/#recipe=MAC_Verify('Hex','AES-CMAC','00112233445566778899AABBCCDDEEFF','Hex','','Method%201','339AF1AD1650E908',true)&input=MTEyMjMzNDQ1NTY2Nzc4OA
  [p12]: https://cyberchef.jacobmarks.com/#recipe=Key_Generate('TDES%20Double-length%20(16%20bytes)',16,true,false)DUKPT_Derive_TDES_Key('Derive%20IPEK','FFFF9876543210E00008','None',false)
  [p13]: https://cyberchef.jacobmarks.com/#recipe=Key_Generate('TDES%20Double-length%20(16%20bytes)',16,true,false)DUKPT_Derive_TDES_Key('Derive%20Session%20Key','FFFF9876543210E00008','PIN',false)
  [p14]: https://cyberchef.jacobmarks.com/#recipe=PIN_Generate(4,'PIN%20digits','')PIN_Block_Build('ISO%20Format%200','5432101234567890',false)PIN_Block_Parse('ISO%20Format%200','5432101234567890')
  [p15]: https://cyberchef.jacobmarks.com/#recipe=TR-31_Parse_Key_Block(false)&input=RDAxMTJQMEFFMDBFMDAwMDEwRUY5OTkwQzgwMkMzRUM3REEwNEM2OUFENjhBNzFCMjM4ODBEQzZDQTY0QjY0Q0UyRTVGMUE0RDA5NTJBM0E
  [p16]: https://cyberchef.jacobmarks.com/#recipe=HSM_Parse_Thales_Command()&input=SEVBREhFMDEyMzQ1Njc4OUFCQ0RFRjAwMTEyMjMzNDQ1NTY2NzclMDBUQUlM
  [p17]: https://cyberchef.jacobmarks.com/#recipe=HSM_Parse_Futurex_Command()&input=W0FPR01BQztGUzY7UlYwMDExMjIzMzQ0NTU2Njc3O10
  [p18]: https://cyberchef.jacobmarks.com/#recipe=Key_Generate('AES-128%20(16%20bytes)',16,false,false)Payment_Calculate_KCV('Hex','AES-CMAC%20(Empty)',6)
  [p20]: https://cyberchef.jacobmarks.com/#recipe=PAN_Generate('Visa','Curated%20sample',16,'Any',true)
  [p21]: https://cyberchef.jacobmarks.com/#recipe=PAN_Generate('Mastercard','Curated%20sample',16,'5-series%20(51-55)',false)PAN_Parse()
  [p22]: https://cyberchef.jacobmarks.com/#recipe=Card_Validation_Data_Generate('CVV2%20/%20CVC2%20(force%20000)','4123456789012345','02','25','MMYY','101',3,false)&input=MDEyMzQ1Njc4OUFCQ0RFRkZFRENCQTk4NzY1NDMyMTA
  [p23]: https://cyberchef.jacobmarks.com/#recipe=Card_Validation_Data_Verify('CVV2%20/%20CVC2%20(force%20000)','4123456789012345','02','25','MMYY','101','221')&input=MDEyMzQ1Njc4OUFCQ0RFRkZFRENCQTk4NzY1NDMyMTA
  [p24]: https://cyberchef.jacobmarks.com/#recipe=PIN_Block_Translate_Encrypted('DDDDEEEEFFFFAAAABBBBCCCCDDDDEEEE','ISO%20Format%200','5432101234567890','AABBCCDDEEFF00112233445566778899','ISO%20Format%200','5432101234567890',false)&input=N0YzODFEQkY5RjY5MDZDNA
  [p25]: https://cyberchef.jacobmarks.com/#recipe=PIN_Block_Translate_Encrypted('DDDDEEEEFFFFAAAABBBBCCCCDDDDEEEE','ISO%20Format%200','5432101234567890','AABBCCDDEEFF00112233445566778899','ISO%20Format%200','5432101234567890',true)&input=N0YzODFEQkY5RjY5MDZDNA
