/* piexifjs
The MIT License (MIT)
Copyright (c) 2014, 2015 hMatoba(https://github.com/hMatoba)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import Utils from "../Utils.mjs";

// Param jpeg should be a binaryArray
export function removeEXIF(jpeg) {
  // Convert binaryArray to char string
  jpeg = Utils.byteArrayToChars(jpeg);
  if (jpeg.slice(0, 2) != "\xff\xd8") {
    throw ("Given data is not jpeg.");
  }

  var segments = splitIntoSegments(jpeg);
  if (segments[1].slice(0, 2) == "\xff\xe1" &&
    segments[1].slice(4, 10) == "Exif\x00\x00") {
    segments = [segments[0]].concat(segments.slice(2));
  } else if (segments[2].slice(0, 2) == "\xff\xe1" &&
    segments[2].slice(4, 10) == "Exif\x00\x00") {
    segments = segments.slice(0, 2).concat(segments.slice(3));
  } else {
    throw ("Exif not found.");
  }

  var new_data = segments.join("");

  // Convert back to binaryArray
  new_data = Utils.strToCharcode(new_data);

  return new_data;
};

function splitIntoSegments(data) {
  if (data.slice(0, 2) != "\xff\xd8") {
    throw ("Given data isn't JPEG.");
  }

  var head = 2;
  var segments = ["\xff\xd8"];
  while (true) {
    if (data.slice(head, head + 2) == "\xff\xda") {
      segments.push(data.slice(head));
      break;
    } else {
      var length = unpack(">H", data.slice(head + 2, head + 4))[0];
      var endPoint = head + length + 2;
      segments.push(data.slice(head, endPoint));
      head = endPoint;
    }

    if (head >= data.length) {
      throw ("Wrong JPEG data.");
    }
  }
  return segments;
}

function unpack(mark, str) {
  if (typeof(str) != "string") {
    throw ("'unpack' error. Got invalid type argument.");
  }
  var l = 0;
  for (var markPointer = 1; markPointer < mark.length; markPointer++) {
    if (mark[markPointer].toLowerCase() == "b") {
      l += 1;
    } else if (mark[markPointer].toLowerCase() == "h") {
      l += 2;
    } else if (mark[markPointer].toLowerCase() == "l") {
      l += 4;
    } else {
      throw ("'unpack' error. Got invalid mark.");
    }
  }

  if (l != str.length) {
    throw ("'unpack' error. Mismatch between symbol and string length. " + l + ":" + str.length);
  }

  var littleEndian;
  if (mark[0] == "<") {
    littleEndian = true;
  } else if (mark[0] == ">") {
    littleEndian = false;
  } else {
    throw ("'unpack' error.");
  }
  var unpacked = [];
  var strPointer = 0;
  var p = 1;
  var val = null;
  var c = null;
  var length = null;
  var sliced = "";

  while (c = mark[p]) {
    if (c.toLowerCase() == "b") {
      length = 1;
      sliced = str.slice(strPointer, strPointer + length);
      val = sliced.charCodeAt(0);
      if ((c == "b") && (val >= 0x80)) {
        val -= 0x100;
      }
    } else if (c == "H") {
      length = 2;
      sliced = str.slice(strPointer, strPointer + length);
      if (littleEndian) {
        sliced = sliced.split("").reverse().join("");
      }
      val = sliced.charCodeAt(0) * 0x100 +
        sliced.charCodeAt(1);
    } else if (c.toLowerCase() == "l") {
      length = 4;
      sliced = str.slice(strPointer, strPointer + length);
      if (littleEndian) {
        sliced = sliced.split("").reverse().join("");
      }
      val = sliced.charCodeAt(0) * 0x1000000 +
        sliced.charCodeAt(1) * 0x10000 +
        sliced.charCodeAt(2) * 0x100 +
        sliced.charCodeAt(3);
      if ((c == "l") && (val >= 0x80000000)) {
        val -= 0x100000000;
      }
    } else {
      throw ("'unpack' error. " + c);
    }

    unpacked.push(val);
    strPointer += length;
    p += 1;
  }

  return unpacked;
}
