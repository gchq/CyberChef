/**
 * @author tlwr [toby@toby.codes]
 *
 * This file is the output of the make.sh script from the npm package `codepage`.
 */

/* output (C) 2013-present SheetJS -- http://sheetjs.com */
/*jshint -W100 */
var cptable = { version: "1.8.0" };
cptable[37] = (function () { var d = "\u0000\u0001\u0002\u0003\t\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\b\u0018\u0019\u001c\u001d\u001e\u001f\n\u0017\u001b\u0005\u0006\u0007\u0016\u0004\u0014\u0015\u001a  âäàáãåçñ¢.<(+|&éêëèíîïìß!$*);¬-/ÂÄÀÁÃÅÇÑ¦,%_>?øÉÊËÈÍÎÏÌ`:#@'=\"Øabcdefghi«»ðýþ±°jklmnopqrªºæ¸Æ¤µ~stuvwxyz¡¿ÐÝÞ®^£¥·©§¶¼½¾[]¯¨´×{ABCDEFGHI­ôöòóõ}JKLMNOPQR¹ûüùúÿ\\÷STUVWXYZ²ÔÖÒÓÕ0123456789³ÛÜÙÚ", D = [], e = {}; for (var i = 0; i != d.length; ++i) { if (d.charCodeAt(i) !== 0xFFFD) e[d.charAt(i)] = i; D[i] = d.charAt(i); } return { "enc": e, "dec": D }; })();
cptable[500] = (function () { var d = "\u0000\u0001\u0002\u0003\t\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\b\u0018\u0019\u001c\u001d\u001e\u001f\n\u0017\u001b\u0005\u0006\u0007\u0016\u0004\u0014\u0015\u001a  âäàáãåçñ[.<(+!&éêëèíîïìß]$*);^-/ÂÄÀÁÃÅÇÑ¦,%_>?øÉÊËÈÍÎÏÌ`:#@'=\"Øabcdefghi«»ðýþ±°jklmnopqrªºæ¸Æ¤µ~stuvwxyz¡¿ÐÝÞ®¢£¥·©§¶¼½¾¬|¯¨´×{ABCDEFGHI­ôöòóõ}JKLMNOPQR¹ûüùúÿ\\÷STUVWXYZ²ÔÖÒÓÕ0123456789³ÛÜÙÚ", D = [], e = {}; for (var i = 0; i != d.length; ++i) { if (d.charCodeAt(i) !== 0xFFFD) e[d.charAt(i)] = i; D[i] = d.charAt(i); } return { "enc": e, "dec": D }; })();

/* cputils.js (C) 2013-present SheetJS -- http://sheetjs.com */
/* vim: set ft=javascript: */
/*jshint newcap: false */
(function (cpt) {
  "use strict";
  var magic = {
    "1200": "utf16le",
    "1201": "utf16be",
    "12000": "utf32le",
    "12001": "utf32be",
    "16969": "utf64le",
    "20127": "ascii",
    "65000": "utf7",
    "65001": "utf8"
  };

  var sbcs_cache = [874, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 10000];
  var dbcs_cache = [932, 936, 949, 950];
  var magic_cache = [65001];
  var magic_decode = {};
  var magic_encode = {};
  var cpdcache = {};
  var cpecache = {};

  var sfcc = function sfcc(x) { return String.fromCharCode(x); };
  var cca = function cca(x) { return x.charCodeAt(0); };

  var has_buf = (typeof Buffer !== 'undefined');
  if (has_buf) {
    var mdl = 1024, mdb = new Buffer(mdl);
    var make_EE = function make_EE(E) {
      var EE = new Buffer(65536);
      for (var i = 0; i < 65536; ++i) EE[i] = 0;
      var keys = Object.keys(E), len = keys.length;
      for (var ee = 0, e = keys[ee]; ee < len; ++ee) {
        if (!(e = keys[ee])) continue;
        EE[e.charCodeAt(0)] = E[e];
      }
      return EE;
    };
    var sbcs_encode = function make_sbcs_encode(cp) {
      var EE = make_EE(cpt[cp].enc);
      return function sbcs_e(data, ofmt) {
        var len = data.length;
        var out, i = 0, j = 0, D = 0, w = 0;
        if (typeof data === 'string') {
          out = new Buffer(len);
          for (i = 0; i < len; ++i) out[i] = EE[data.charCodeAt(i)];
        } else if (Buffer.isBuffer(data)) {
          out = new Buffer(2 * len);
          j = 0;
          for (i = 0; i < len; ++i) {
            D = data[i];
            if (D < 128) out[j++] = EE[D];
            else if (D < 224) { out[j++] = EE[((D & 31) << 6) + (data[i + 1] & 63)]; ++i; }
            else if (D < 240) { out[j++] = EE[((D & 15) << 12) + ((data[i + 1] & 63) << 6) + (data[i + 2] & 63)]; i += 2; }
            else {
              w = ((D & 7) << 18) + ((data[i + 1] & 63) << 12) + ((data[i + 2] & 63) << 6) + (data[i + 3] & 63); i += 3;
              if (w < 65536) out[j++] = EE[w];
              else { w -= 65536; out[j++] = EE[0xD800 + ((w >> 10) & 1023)]; out[j++] = EE[0xDC00 + (w & 1023)]; }
            }
          }
          out = out.slice(0, j);
        } else {
          out = new Buffer(len);
          for (i = 0; i < len; ++i) out[i] = EE[data[i].charCodeAt(0)];
        }
        if (!ofmt || ofmt === 'buf') return out;
        if (ofmt !== 'arr') return out.toString('binary');
        return [].slice.call(out);
      };
    };
    var sbcs_decode = function make_sbcs_decode(cp) {
      var D = cpt[cp].dec;
      var DD = new Buffer(131072), d = 0, c = "";
      for (d = 0; d < D.length; ++d) {
        if (!(c = D[d])) continue;
        var w = c.charCodeAt(0);
        DD[2 * d] = w & 255; DD[2 * d + 1] = w >> 8;
      }
      return function sbcs_d(data) {
        var len = data.length, i = 0, j = 0;
        if (2 * len > mdl) { mdl = 2 * len; mdb = new Buffer(mdl); }
        if (Buffer.isBuffer(data)) {
          for (i = 0; i < len; i++) {
            j = 2 * data[i];
            mdb[2 * i] = DD[j]; mdb[2 * i + 1] = DD[j + 1];
          }
        } else if (typeof data === "string") {
          for (i = 0; i < len; i++) {
            j = 2 * data.charCodeAt(i);
            mdb[2 * i] = DD[j]; mdb[2 * i + 1] = DD[j + 1];
          }
        } else {
          for (i = 0; i < len; i++) {
            j = 2 * data[i];
            mdb[2 * i] = DD[j]; mdb[2 * i + 1] = DD[j + 1];
          }
        }
        return mdb.slice(0, 2 * len).toString('ucs2');
      };
    };
    var dbcs_encode = function make_dbcs_encode(cp) {
      var E = cpt[cp].enc;
      var EE = new Buffer(131072);
      for (var i = 0; i < 131072; ++i) EE[i] = 0;
      var keys = Object.keys(E);
      for (var ee = 0, e = keys[ee]; ee < keys.length; ++ee) {
        if (!(e = keys[ee])) continue;
        var f = e.charCodeAt(0);
        EE[2 * f] = E[e] & 255; EE[2 * f + 1] = E[e] >> 8;
      }
      return function dbcs_e(data, ofmt) {
        var len = data.length, out = new Buffer(2 * len), i = 0, j = 0, jj = 0, k = 0, D = 0;
        if (typeof data === 'string') {
          for (i = k = 0; i < len; ++i) {
            j = data.charCodeAt(i) * 2;
            out[k++] = EE[j + 1] || EE[j]; if (EE[j + 1] > 0) out[k++] = EE[j];
          }
          out = out.slice(0, k);
        } else if (Buffer.isBuffer(data)) {
          for (i = k = 0; i < len; ++i) {
            D = data[i];
            if (D < 128) j = D;
            else if (D < 224) { j = ((D & 31) << 6) + (data[i + 1] & 63); ++i; }
            else if (D < 240) { j = ((D & 15) << 12) + ((data[i + 1] & 63) << 6) + (data[i + 2] & 63); i += 2; }
            else { j = ((D & 7) << 18) + ((data[i + 1] & 63) << 12) + ((data[i + 2] & 63) << 6) + (data[i + 3] & 63); i += 3; }
            if (j < 65536) { j *= 2; out[k++] = EE[j + 1] || EE[j]; if (EE[j + 1] > 0) out[k++] = EE[j]; }
            else {
              jj = j - 65536;
              j = 2 * (0xD800 + ((jj >> 10) & 1023)); out[k++] = EE[j + 1] || EE[j]; if (EE[j + 1] > 0) out[k++] = EE[j];
              j = 2 * (0xDC00 + (jj & 1023)); out[k++] = EE[j + 1] || EE[j]; if (EE[j + 1] > 0) out[k++] = EE[j];
            }
          }
          out = out.slice(0, k);
        } else {
          for (i = k = 0; i < len; i++) {
            j = data[i].charCodeAt(0) * 2;
            out[k++] = EE[j + 1] || EE[j]; if (EE[j + 1] > 0) out[k++] = EE[j];
          }
        }
        if (!ofmt || ofmt === 'buf') return out;
        if (ofmt !== 'arr') return out.toString('binary');
        return [].slice.call(out);
      };
    };
    var dbcs_decode = function make_dbcs_decode(cp) {
      var D = cpt[cp].dec;
      var DD = new Buffer(131072), d = 0, c, w = 0, j = 0, i = 0;
      for (i = 0; i < 65536; ++i) { DD[2 * i] = 0xFF; DD[2 * i + 1] = 0xFD; }
      for (d = 0; d < D.length; ++d) {
        if (!(c = D[d])) continue;
        w = c.charCodeAt(0);
        j = 2 * d;
        DD[j] = w & 255; DD[j + 1] = w >> 8;
      }
      return function dbcs_d(data) {
        var len = data.length, out = new Buffer(2 * len), i = 0, j = 0, k = 0;
        if (Buffer.isBuffer(data)) {
          for (i = 0; i < len; i++) {
            j = 2 * data[i];
            if (DD[j] === 0xFF && DD[j + 1] === 0xFD) { j = 2 * ((data[i] << 8) + data[i + 1]); ++i; }
            out[k++] = DD[j]; out[k++] = DD[j + 1];
          }
        } else if (typeof data === "string") {
          for (i = 0; i < len; i++) {
            j = 2 * data.charCodeAt(i);
            if (DD[j] === 0xFF && DD[j + 1] === 0xFD) { j = 2 * ((data.charCodeAt(i) << 8) + data.charCodeAt(i + 1)); ++i; }
            out[k++] = DD[j]; out[k++] = DD[j + 1];
          }
        } else {
          for (i = 0; i < len; i++) {
            j = 2 * data[i];
            if (DD[j] === 0xFF && DD[j + 1] === 0xFD) { j = 2 * ((data[i] << 8) + data[i + 1]); ++i; }
            out[k++] = DD[j]; out[k++] = DD[j + 1];
          }
        }
        return out.slice(0, k).toString('ucs2');
      };
    };
    magic_decode[65001] = function utf8_d(data) {
      if (typeof data === "string") return utf8_d(data.split("").map(cca));
      var len = data.length, w = 0, ww = 0;
      if (4 * len > mdl) { mdl = 4 * len; mdb = new Buffer(mdl); }
      var i = 0;
      if (len >= 3 && data[0] == 0xEF) if (data[1] == 0xBB && data[2] == 0xBF) i = 3;
      for (var j = 1, k = 0, D = 0; i < len; i += j) {
        j = 1; D = data[i];
        if (D < 128) w = D;
        else if (D < 224) { w = (D & 31) * 64 + (data[i + 1] & 63); j = 2; }
        else if (D < 240) { w = ((D & 15) << 12) + (data[i + 1] & 63) * 64 + (data[i + 2] & 63); j = 3; }
        else { w = (D & 7) * 262144 + ((data[i + 1] & 63) << 12) + (data[i + 2] & 63) * 64 + (data[i + 3] & 63); j = 4; }
        if (w < 65536) { mdb[k++] = w & 255; mdb[k++] = w >> 8; }
        else {
          w -= 65536; ww = 0xD800 + ((w >> 10) & 1023); w = 0xDC00 + (w & 1023);
          mdb[k++] = ww & 255; mdb[k++] = ww >>> 8; mdb[k++] = w & 255; mdb[k++] = (w >>> 8) & 255;
        }
      }
      return mdb.slice(0, k).toString('ucs2');
    };
    magic_encode[65001] = function utf8_e(data, ofmt) {
      if (has_buf && Buffer.isBuffer(data)) {
        if (!ofmt || ofmt === 'buf') return data;
        if (ofmt !== 'arr') return data.toString('binary');
        return [].slice.call(data);
      }
      var len = data.length, w = 0, ww = 0, j = 0;
      var direct = typeof data === "string";
      if (4 * len > mdl) { mdl = 4 * len; mdb = new Buffer(mdl); }
      for (var i = 0; i < len; ++i) {
        w = direct ? data.charCodeAt(i) : data[i].charCodeAt(0);
        if (w <= 0x007F) mdb[j++] = w;
        else if (w <= 0x07FF) {
          mdb[j++] = 192 + (w >> 6);
          mdb[j++] = 128 + (w & 63);
        } else if (w >= 0xD800 && w <= 0xDFFF) {
          w -= 0xD800; ++i;
          ww = (direct ? data.charCodeAt(i) : data[i].charCodeAt(0)) - 0xDC00 + (w << 10);
          mdb[j++] = 240 + ((ww >>> 18) & 0x07);
          mdb[j++] = 144 + ((ww >>> 12) & 0x3F);
          mdb[j++] = 128 + ((ww >>> 6) & 0x3F);
          mdb[j++] = 128 + (ww & 0x3F);
        } else {
          mdb[j++] = 224 + (w >> 12);
          mdb[j++] = 128 + ((w >> 6) & 63);
          mdb[j++] = 128 + (w & 63);
        }
      }
      if (!ofmt || ofmt === 'buf') return mdb.slice(0, j);
      if (ofmt !== 'arr') return mdb.slice(0, j).toString('binary');
      return [].slice.call(mdb, 0, j);
    };
  }

  var encache = function encache() {
    if (has_buf) {
      if (cpdcache[sbcs_cache[0]]) return;
      var i = 0, s = 0;
      for (i = 0; i < sbcs_cache.length; ++i) {
        s = sbcs_cache[i];
        if (cpt[s]) {
          cpdcache[s] = sbcs_decode(s);
          cpecache[s] = sbcs_encode(s);
        }
      }
      for (i = 0; i < dbcs_cache.length; ++i) {
        s = dbcs_cache[i];
        if (cpt[s]) {
          cpdcache[s] = dbcs_decode(s);
          cpecache[s] = dbcs_encode(s);
        }
      }
      for (i = 0; i < magic_cache.length; ++i) {
        s = magic_cache[i];
        if (magic_decode[s]) cpdcache[s] = magic_decode[s];
        if (magic_encode[s]) cpecache[s] = magic_encode[s];
      }
    }
  };
  var null_enc = function (data, ofmt) { return ""; };
  var cp_decache = function cp_decache(cp) { delete cpdcache[cp]; delete cpecache[cp]; };
  var decache = function decache() {
    if (has_buf) {
      if (!cpdcache[sbcs_cache[0]]) return;
      sbcs_cache.forEach(cp_decache);
      dbcs_cache.forEach(cp_decache);
      magic_cache.forEach(cp_decache);
    }
    last_enc = null_enc; last_cp = 0;
  };
  var cache = {
    encache: encache,
    decache: decache,
    sbcs: sbcs_cache,
    dbcs: dbcs_cache
  };

  encache();

  var BM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var SetD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'(),-./:?";
  var last_enc = null_enc, last_cp = 0;
  var encode = function encode(cp, data, ofmt) {
    if (cp === last_cp && last_enc) { return last_enc(data, ofmt); }
    if (cpecache[cp]) { last_enc = cpecache[last_cp = cp]; return last_enc(data, ofmt); }
    if (has_buf && Buffer.isBuffer(data)) data = data.toString('utf8');
    var len = data.length;
    var out = has_buf ? new Buffer(4 * len) : [], w = 0, i = 0, j = 0, ww = 0;
    var C = cpt[cp], E, M = "";
    var isstr = typeof data === 'string';
    if (C && (E = C.enc)) for (i = 0; i < len; ++i, ++j) {
      w = E[isstr ? data.charAt(i) : data[i]];
      if (w > 255) {
        out[j] = w >> 8;
        out[++j] = w & 255;
      } else out[j] = w & 255;
    }
    else if ((M = magic[cp])) switch (M) {
      case "utf8":
        if (has_buf && isstr) { out = new Buffer(data, M); j = out.length; break; }
        for (i = 0; i < len; ++i, ++j) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          if (w <= 0x007F) out[j] = w;
          else if (w <= 0x07FF) {
            out[j] = 192 + (w >> 6);
            out[++j] = 128 + (w & 63);
          } else if (w >= 0xD800 && w <= 0xDFFF) {
            w -= 0xD800;
            ww = (isstr ? data.charCodeAt(++i) : data[++i].charCodeAt(0)) - 0xDC00 + (w << 10);
            out[j] = 240 + ((ww >>> 18) & 0x07);
            out[++j] = 144 + ((ww >>> 12) & 0x3F);
            out[++j] = 128 + ((ww >>> 6) & 0x3F);
            out[++j] = 128 + (ww & 0x3F);
          } else {
            out[j] = 224 + (w >> 12);
            out[++j] = 128 + ((w >> 6) & 63);
            out[++j] = 128 + (w & 63);
          }
        }
        break;
      case "ascii":
        if (has_buf && typeof data === "string") { out = new Buffer(data, M); j = out.length; break; }
        for (i = 0; i < len; ++i, ++j) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          if (w <= 0x007F) out[j] = w;
          else throw new Error("bad ascii " + w);
        }
        break;
      case "utf16le":
        if (has_buf && typeof data === "string") { out = new Buffer(data, M); j = out.length; break; }
        for (i = 0; i < len; ++i) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          out[j++] = w & 255;
          out[j++] = w >> 8;
        }
        break;
      case "utf16be":
        for (i = 0; i < len; ++i) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          out[j++] = w >> 8;
          out[j++] = w & 255;
        }
        break;
      case "utf32le":
        for (i = 0; i < len; ++i) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          if (w >= 0xD800 && w <= 0xDFFF) w = 0x10000 + ((w - 0xD800) << 10) + (data[++i].charCodeAt(0) - 0xDC00);
          out[j++] = w & 255; w >>= 8;
          out[j++] = w & 255; w >>= 8;
          out[j++] = w & 255; w >>= 8;
          out[j++] = w & 255;
        }
        break;
      case "utf32be":
        for (i = 0; i < len; ++i) {
          w = isstr ? data.charCodeAt(i) : data[i].charCodeAt(0);
          if (w >= 0xD800 && w <= 0xDFFF) w = 0x10000 + ((w - 0xD800) << 10) + (data[++i].charCodeAt(0) - 0xDC00);
          out[j + 3] = w & 255; w >>= 8;
          out[j + 2] = w & 255; w >>= 8;
          out[j + 1] = w & 255; w >>= 8;
          out[j] = w & 255;
          j += 4;
        }
        break;
      case "utf7":
        for (i = 0; i < len; i++) {
          var c = isstr ? data.charAt(i) : data[i].charAt(0);
          if (c === "+") { out[j++] = 0x2b; out[j++] = 0x2d; continue; }
          if (SetD.indexOf(c) > -1) { out[j++] = c.charCodeAt(0); continue; }
          var tt = encode(1201, c);
          out[j++] = 0x2b;
          out[j++] = BM.charCodeAt(tt[0] >> 2);
          out[j++] = BM.charCodeAt(((tt[0] & 0x03) << 4) + ((tt[1] || 0) >> 4));
          out[j++] = BM.charCodeAt(((tt[1] & 0x0F) << 2) + ((tt[2] || 0) >> 6));
          out[j++] = 0x2d;
        }
        break;
      default: throw new Error("Unsupported magic: " + cp + " " + magic[cp]);
    }
    else throw new Error("Unrecognized CP: " + cp);
    out = out.slice(0, j);
    if (!has_buf) return (ofmt == 'str') ? (out).map(sfcc).join("") : out;
    if (!ofmt || ofmt === 'buf') return out;
    if (ofmt !== 'arr') return out.toString('binary');
    return [].slice.call(out);
  };
  var decode = function decode(cp, data) {
    var F; if ((F = cpdcache[cp])) return F(data);
    if (typeof data === "string") return decode(cp, data.split("").map(cca));
    var len = data.length, out = new Array(len), s = "", w = 0, i = 0, j = 1, k = 0, ww = 0;
    var C = cpt[cp], D, M = "";
    if (C && (D = C.dec)) {
      for (i = 0; i < len; i += j) {
        j = 2;
        s = D[(data[i] << 8) + data[i + 1]];
        if (!s) {
          j = 1;
          s = D[data[i]];
        }
        if (!s) throw new Error('Unrecognized code: ' + data[i] + ' ' + data[i + j - 1] + ' ' + i + ' ' + j + ' ' + D[data[i]]);
        out[k++] = s;
      }
    }
    else if ((M = magic[cp])) switch (M) {
      case "utf8":
        if (len >= 3 && data[0] == 0xEF) if (data[1] == 0xBB && data[2] == 0xBF) i = 3;
        for (; i < len; i += j) {
          j = 1;
          if (data[i] < 128) w = data[i];
          else if (data[i] < 224) { w = (data[i] & 31) * 64 + (data[i + 1] & 63); j = 2; }
          else if (data[i] < 240) { w = ((data[i] & 15) << 12) + (data[i + 1] & 63) * 64 + (data[i + 2] & 63); j = 3; }
          else { w = (data[i] & 7) * 262144 + ((data[i + 1] & 63) << 12) + (data[i + 2] & 63) * 64 + (data[i + 3] & 63); j = 4; }
          if (w < 65536) { out[k++] = String.fromCharCode(w); }
          else {
            w -= 65536; ww = 0xD800 + ((w >> 10) & 1023); w = 0xDC00 + (w & 1023);
            out[k++] = String.fromCharCode(ww); out[k++] = String.fromCharCode(w);
          }
        }
        break;
      case "ascii":
        if (has_buf && Buffer.isBuffer(data)) return data.toString(M);
        for (i = 0; i < len; i++) out[i] = String.fromCharCode(data[i]);
        k = len; break;
      case "utf16le":
        if (len >= 2 && data[0] == 0xFF) if (data[1] == 0xFE) i = 2;
        if (has_buf && Buffer.isBuffer(data)) return data.toString(M);
        j = 2;
        for (; i + 1 < len; i += j) {
          out[k++] = String.fromCharCode((data[i + 1] << 8) + data[i]);
        }
        break;
      case "utf16be":
        if (len >= 2 && data[0] == 0xFE) if (data[1] == 0xFF) i = 2;
        j = 2;
        for (; i + 1 < len; i += j) {
          out[k++] = String.fromCharCode((data[i] << 8) + data[i + 1]);
        }
        break;
      case "utf32le":
        if (len >= 4 && data[0] == 0xFF) if (data[1] == 0xFE && data[2] === 0 && data[3] === 0) i = 4;
        j = 4;
        for (; i < len; i += j) {
          w = (data[i + 3] << 24) + (data[i + 2] << 16) + (data[i + 1] << 8) + (data[i]);
          if (w > 0xFFFF) {
            w -= 0x10000;
            out[k++] = String.fromCharCode(0xD800 + ((w >> 10) & 0x3FF));
            out[k++] = String.fromCharCode(0xDC00 + (w & 0x3FF));
          }
          else out[k++] = String.fromCharCode(w);
        }
        break;
      case "utf32be":
        if (len >= 4 && data[3] == 0xFF) if (data[2] == 0xFE && data[1] === 0 && data[0] === 0) i = 4;
        j = 4;
        for (; i < len; i += j) {
          w = (data[i] << 24) + (data[i + 1] << 16) + (data[i + 2] << 8) + (data[i + 3]);
          if (w > 0xFFFF) {
            w -= 0x10000;
            out[k++] = String.fromCharCode(0xD800 + ((w >> 10) & 0x3FF));
            out[k++] = String.fromCharCode(0xDC00 + (w & 0x3FF));
          }
          else out[k++] = String.fromCharCode(w);
        }
        break;
      case "utf7":
        if (len >= 4 && data[0] == 0x2B && data[1] == 0x2F && data[2] == 0x76) {
          if (len >= 5 && data[3] == 0x38 && data[4] == 0x2D) i = 5;
          else if (data[3] == 0x38 || data[3] == 0x39 || data[3] == 0x2B || data[3] == 0x2F) i = 4;
        }
        for (; i < len; i += j) {
          if (data[i] !== 0x2b) { j = 1; out[k++] = String.fromCharCode(data[i]); continue; }
          j = 1;
          if (data[i + 1] === 0x2d) { j = 2; out[k++] = "+"; continue; }
          while (String.fromCharCode(data[i + j]).match(/[A-Za-z0-9+\/]/)) j++;
          var dash = 0;
          if (data[i + j] === 0x2d) { ++j; dash = 1; }
          var tt = [];
          var o64 = "";
          var c1 = 0, c2 = 0, c3 = 0;
          var e1 = 0, e2 = 0, e3 = 0, e4 = 0;
          for(var l = 1; l < j - dash;) {
            e1 = BM.indexOf(String.fromCharCode(data[i + l++]));
            e2 = BM.indexOf(String.fromCharCode(data[i + l++]));
            c1 = e1 << 2 | e2 >> 4;
            tt.push(c1);
            e3 = BM.indexOf(String.fromCharCode(data[i + l++]));
            if (e3 === -1) break;
            c2 = (e2 & 15) << 4 | e3 >> 2;
            tt.push(c2);
            e4 = BM.indexOf(String.fromCharCode(data[i + l++]));
            if (e4 === -1) break;
            c3 = (e3 & 3) << 6 | e4;
            if (e4 < 64) tt.push(c3);
          }
          o64 = decode(1201, tt);
          for (l = 0; l < o64.length; ++l) out[k++] = o64.charAt(l);
        }
        break;
      default: throw new Error("Unsupported magic: " + cp + " " + magic[cp]);
    }
    else throw new Error("Unrecognized CP: " + cp);
    return out.slice(0, k).join("");
  };
  var hascp = function hascp(cp) { return !!(cpt[cp] || magic[cp]); };
  cpt.utils = { decode: decode, encode: encode, hascp: hascp, magic: magic, cache: cache };
}(cptable));

export default cptable;