/**
 * GOST R 34.11-94 / GOST R 34.11-12 implementation
 * 1.76
 * 2014-2016, Rudolf Nickolaev. All rights reserved.
 *
 * Exported for CyberChef by mshwed [m@ttshwed.com]
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Converted to JavaScript from source https://www.streebog.net/
 * Copyright (c) 2013, Alexey Degtyarev.
 * All rights reserved.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

import GostRandom from "./gostRandom.mjs";
import GostCipher from "./gostCipher.mjs";
import crypto from "crypto";

/*
 * GOST R 34.11
 * Common methods
 *
 */ // <editor-fold defaultstate="collapsed">

var root = {};
var rootCrypto = crypto;

var DataError = Error,
    NotSupportedError = Error;

// Copy len values from s[sOfs] to d[dOfs]
function arraycopy(s, sOfs, d, dOfs, len) {
    for (var i = 0; i < len; i++) d[dOfs + i] = s[sOfs + i];
}

// Swap bytes in buffer
function swap(s) {
    var src = new Uint8Array(s),
        dst = new Uint8Array(src.length);
    for (var i = 0, n = src.length; i < n; i++) dst[n - i - 1] = src[i];
    return dst.buffer;
}

// Convert BASE64 string to Uint8Array
// for decompression of constants and precalc values
function b64decode(s) {
    // s = s.replace(/[^A-Za-z0-9\+\/]/g, '');
    var n = s.length,
        k = (n * 3 + 1) >> 2,
        r = new Uint8Array(k);

    for (var m3, m4, u24 = 0, j = 0, i = 0; i < n; i++) {
        m4 = i & 3;
        var c = s.charCodeAt(i);

        c =
            c > 64 && c < 91
                ? c - 65
                : c > 96 && c < 123
                  ? c - 71
                  : c > 47 && c < 58
                      ? c + 4
                      : c === 43
                          ? 62
                          : c === 47
                              ? 63
                              : 0;

        u24 |= c << (18 - 6 * m4);
        if (m4 === 3 || n - i === 1) {
            for (m3 = 0; m3 < 3 && j < k; m3++, j++) {
                r[j] = (u24 >>> ((16 >>> m3) & 24)) & 255;
            }
            u24 = 0;
        }
    }
    return r.buffer;
}

// Random seed
function getSeed(length) {
    GostRandom = GostRandom || root.GostRandom;
    var randomSource = GostRandom
        ? new (GostRandom || root.GostRandom)()
        : rootCrypto;
    if (randomSource.getRandomValues) {
        var d = new Uint8Array(Math.ceil(length / 8));
        randomSource.getRandomValues(d);
        return d;
    } else throw new NotSupportedError("Random generator not found");
}

// Check buffer
function buffer(d) {
    if (d instanceof ArrayBuffer) return d;
    else if (d && d?.buffer instanceof ArrayBuffer)
        return d.byteOffset === 0 && d.byteLength === d.buffer.byteLength
            ? d.buffer
            : new Uint8Array(new Uint8Array(d, d.byteOffset, d.byteLength))
                  .buffer;
    else throw new DataError("ArrayBuffer or ArrayBufferView required");
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11 or GOST R 34.11-12<br><br>
 *
 * http://tools.ietf.org/html/rfc6986
 *
 * The digest method returns digest data in according to GOST R 4311-2012.<br>
 * Size of digest also defines in algorithm name.
 *  <ul>
 *      <li>GOST R 34.11-256-12 - 256 bits digest</li>
 *      <li>GOST R 34.11-512-12 - 512 bits digest</li>
 *  </ul>
 *
 * @memberOf GostDigest
 * @method digest
 * @instance
 * @param {(ArrayBuffer|TypedArray)} data Data
 * @returns {ArrayBuffer} Digest of data
 */
var digest2012 = (function () {
    // <editor-fold defaultstate="collapsed">
    // Constants
    var buffer0 = new Int32Array(16); // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var buffer512 = new Int32Array(16); // [512, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    buffer512[0] = 512;

    // Constant C
    var C = (function (s) {
        var h = new Int32Array(b64decode(s)),
            r = new Array(12);
        for (var i = 0; i < 12; i++)
            r[i] = new Int32Array(h.buffer, i * 64, 16);
        return r;
    })(
        "B0Wm8lllgN0jTXTMNnR2BRXTYKQIKkKiAWlnkpHgfEv8xIV1jbhOcRbQRS5DdmovH3xlwIEvy+vp2soe2lsIsbebsSFwBHnmVs3L1xui3VXKpwrbwmG1XFiZ1hJrF7WaMQG1Fg9e1WGYKyMKcur+89e1cA9GneNPGi+dqYq1o2+yCroK9ZYemTHbeoZD9LbCCdtiYDc6ycGxnjWQ5A/i03t7KbEUderyix+cUl9e8QY1hD1qKPw5Cscvzius3HT1LtHjhLy+DCLxN+iToepTNL4DUpMzE7fYddYD7YIs16k/NV5orRxynX08XDN+hY5I3eRxXaDhSPnSZhXos98f71f+bHz9WBdg9WPqqX6iVnoWGicjtwD/36P1OiVHF82/vf8PgNc1njVKEIYWHxwVf2MjqWwMQT+amUdHraxr6ktufWRGekBo+jVPkDZyxXG/tsa+wmYf8gq0t5oct6b6z8aO8Jq0mn8YbKRCUfnEZi3AOTB6O8Okb9nTOh2urk+uk9QUOk1WhojzSjyiTEUXNQQFSiiDaUcGNyyCLcWrkgnJk3oZMz5H08mHv+bHxp45VAkkv/6GrFHsxaruFg7H9B7nAr/UDX+k" +
            "2ahRWTXCrDYvxKXRK43RaZAGm5LLK4n0msTbTTtEtIke3jaccfi3TkFBbgwCqucDp8mTTUJbH5vbWiODUURhcmAqH8uS3DgOVJwHppqKK3uxzrLbC0QKgIQJDeC3Vdk8JEKJJRs6fTreXxbs2JpMlJsiMRZUWo837ZxFmPvHtHTDtjsV0fqYNvRSdjswbB56SzNprwJn558DYTMbiuH/H9t4iv8c50GJ8/PkskjlKjhSbwWApt6+qxst84HNpMprXdhvwEpZot6Ybkd9Hc2678q5SOrvcR2KeWaEFCGAASBhB6vru2v62JT+WmPNxgIw+4nI79CezXsg1xvxSpK8SJkbstnVF/T6UijhiKqkHeeGzJEYne+AXZufITDUEiD4dx3fvDI8pM16sUkEsIAT0roxFvFn5443",
    );

    // Precalc Ax
    var Ax = (function (s) {
        return new Int32Array(b64decode(s));
    })(
        "5vh+XFtxH9Alg3eACST6FshJ4H6FLqSoW0aGoY8GwWoLMumi13tBbqvaN6RngVxm9heWqBpoZnb13AtwY5GVS0hi84235kvx/1ximmi9hcXLgn2m/NdXlWbTba9pufCJNWyfdEg9g7B8vOyxI4yZoTanAqwxxHCNnrao0C+839aLGfpR5bOuN5zPtUCKEn0LvAx4tQggj1rlM+OEIojs7c7Cx9N3wV/S7HgXtlBdD165TMLAgzaHHYwgXbTLCwStdjyFWyigiS9YjRt59v8yVz/s9p5DEZM+D8DTn4A6GMnuAQom9fOtgxDv6PRBGXmmXc2hDH3pOhBKG+4dEkjpLFO/8tshhHM5tPUMz6aiPQlftLyc2EeYzeiKLYsHHFb5f3dxaVp1apzF8C5xoLoevKZj+atCFeZyLrGeIt5fu3gNuc4PJZS6FIJSDmOXZk2ELwMeagII6phcfyFEob5r8Ho3yxzRY2Lbg+COK0sxHGTPcEebq5YOMoVrqYa53ucetUeMh3r1bOm4/kKIX2HW/RvdAVaWYjjIYiFXkj74qS78l/9CEUR2+J19NQhWRSzrTJDJsOCnElYjCFAt+8sBbC16A/qnpkhF" +
            "9G6LOL/GxKu9vvj91HfeujqsTOvIB5t58JyxBeiHnQwn+moQrIpYy4lg58FAHQzqGm+BHko1aSiQxPsHc9GW/0NQGi9gnQqf96UW4MY/N5Yc5KazuNqSUhMkdSw44IqbpahkczvsFU8r8SRXVUmzP9dm2xVEDcXHp9F5455Ct5La3xUaYZl/04agNF7AJxQjONVRe22pOaRlGPB3EEADtAJ5HZClrqLdiNJniZxKXQqTD2bfCihlwk7p1CBFCbCLMlU4kWaFKSpBKQe/xTOoQrJ+K2JUTcZzbFMERWKV4Ada9AbpU1GQih8vO2vBI2Fvw3sJ3FJV5cY5Z9Ezsf5oRCmIOcfw5xHiQJuH9xlk+aLpOK3D20sHGQwLTkf5w+v0VTTVdtNriENGEKBa64sC2CDDzfWCMvJRbeGEDb7Cseeg6N4GsPodCHuFS1QNNDM7QuKaZ7zKW3/YpgiKxDfdDsY7s6nZQ+2BIXFNvV5lo7FnYe3nte6haSQx98jVc6v21R/GheGjZxpeBjzUBBDJLSg6uY8ssEACj+vAbLLy95AX1k8Rb6HTPOBzWfGpnuSqeE7WjHTNwAZuKhnVxztC2ocStBYccEXD" +
            "NxWC5O2TIW2s45BBSTn2/H7F8SGGIjt8wLCUBCusFvv510U3mlJ+v3N8Py6jtoFoM+e42brSeMqpoyo0wi/+u+SBY8z+370NjllAJG6lpnBRxu9LhCrR5CK60GUnnFCM2RSIwhhgjO4xnqVJH3zaF9OU4SgTTJxgCUv0MnLV47Ob9hKlpKrXkcy72kPSb/0PNN4fPJRq0lBPW1RomV7ha9+fr2/qj3eUJkjqWHDdCSu/x+Vtcdl8Z93msv9PIdVJPCdrRjroYAORdntPr4bHH2ihPng11LmgtowRXwMMn9QUHdLJFlggAZg9j33dUySsZKpwP8wXUlTCyYmUjgK0Jj5edtafRsLeUHRvA1h9gARF2z2CknLx5WBYSgKbVgvz+65Ypz/83GKhWl5ObK1M6EupblXOH7jMCPl0eq6CslPBAhRM9/tHG58EKJjz6442BosnrfLv+3rtypf+jApevneOBRP099jPMCwlAcMri/eNkt38F1xVTfhlxX9GBS9f6vMwG6Ky9CSqaLfsu9YNhpmPDzUBBHVMAAAAAAAAAADxLjFNNNDM7HEFIr4GGCO1rygNmTDABcGX/VziXWk8ZRmkHMYzzJoV" +
            "lYRBcvjHnrjcVDK3k3aEqZQ2wTokkM9YgCsT8zLI71nEQq45fO1PXPoc2O/jq42C8uWslU0pP9Fq2CPokHobfU0iSfg88EO2A8ud2Hn58z3eLS8nNtgmdCpDpB+JHuLfb5iZnRtsEzrUrUbNPfQ2+rs131AmmCXAlk/cqoE+bYXrQbBTfuWlxAVAunWLFghHpBrkO+e7RK/juMQp0GcXl4GZk7vun765rpqN0eyXVCHzVyzdkX5uMWOT19rir/jOR6IgEjfcUzijI0PeyQPuNXn8VsSompHmAbKASNxXUeASlvVk5Lfbe3X3GINRWXoS222VUr3OLjMenbsjHXQwj1INcpP90yLZ4gpEYQwwRnf+7uLStOrUJcow/e4ggAZ1YerKSkcBWhPnSv4UhyZOMCzIg7J78RmlFmTPWbP2gtyoEap8HnivWx1WJvtkjcOytz6RF99bzjTQX3zwarVvXf0lfwrNEycYV03I5nbFKp4HOaflLriqmlSGVT4PPNmjVv9IrqqSe36+dWUlrY4th30ObPn/28hBOx7MoxRQyplpE74w6YPoQK1REAmVbqccsbW2ui20NU5Eab3KTiWgBRWvUoHKD3Hh" +
            "dEWYy40OK/JZP5sxKqhjt++zim4ppPxja2qjoEwtSp09lesO5r8x46KRw5YVVL/VGBacju+by/URXWi8nU4oRrqHXxj6z3Qg0e38uLbiPr2wBzby8eNkroTZKc5libb+cLei9tpPclUOclPXXG1JKQTyOj1XQVmnCoBp6gssEI5J0HPFa7EaEYqrehk55P/XzQlaCw44rO/J+2A2WXn1SJK95pfWfzQix4kz4QUUvGHhwdm5dcm1StImYWDPG82AmkSS7Xj9hnGzzKsqiBqXk3LOv2Z/4dCI1tRbXZhalCfIEagFjD9V3mX1tDGWtQYZ90+WsdZwbkOFnR6Ly0PTNlqrioXM+j2E+ce/mcKV/P2iH9Wh3ktjD82z73Y7i0VtgD9Z+Hz3w4WyfHO+XzGRPJjjrGYzsEghv2FnTCa4+BgP+8mVxMEwyKqghiAQdhqYYFfzQiEBFqr2PHYMBlTMNS3bRcxmfZBCvPRalkvUA4Jo6KDD7zxvPae9ktJp/3O8KQriAgHtIoe33jTN6IWBj9kB7qfdYQWb1vonMhmgNVPVbxrodMzOyeoxJFwug/VUcDRVXaB75JnOJtKsVue+9/0WGFelBU44" +
            "ag59pFJ0NtFb2Go4HN6f8sr3dWIxdwwysJqu2eJ5yNBd7xCRxgZ02xEQRqJRXlBFI1Ns5HKYAvzFDLz39bY8+nOhaIfNFx8DfSlBr9nyjb0/Xj60Wk87nYTu/jYbZ3FAPbjj0+cHYnEaOij58g/SSH68fHW0nnYndOXyk8frVlwY3PWeT0eLpAxu9E+prctSxpmBLZjax2B4iwbcbkadDvxl+Op1IexOMKX3IZ6OC1Ur7D9lvKV7a93QSWm68bdemZBM2+OU6lcUsgHR5upA9ruwwIJBKErdUPIEY7+PHf/o1/k7k8usuE2Mto5HfIbowd0bOZImjj98WqESCdYvyy89mKvbNcmuZxNpViv9X/UVweFsNs7igB1+su3485sX2pTTfbAN/gGHe8PsdguK2suEld/hU65EBaJHc7e0ELMShXt4PDKr3463cNBoElE7U2c5udLj5mVYTVficbJkaNeJx4/JhJclqTW7+n0a4QKLFTej36ZBiNDNXZvDeN56Ssgsmk2Az7dCd38bg722IHLSiDodM711XnotS6tqj0H02qtruxyV2ZBc/+f9jTG2g6pkIhGbOB/ArvuEQgIsSaD5CMZjAzrj" +
            "pCivCASTiCat5Bw0GopTx65xIe535qhdxH9cSiWSnoy1OOmqVc3YYwY3eqna2OspoYroe7MnmJVu39pqNeSEFGt9nRmCUJSn1Bz6VaTobL/lyu3J6kLFnKNsNRwOb8F5UYHk3m+rv4n/8MUwGE0X1J1B6xWEBFiSHA1SUCjXOWHxeOwYDKiFapoFcQGO+BHNQJGifD7178wZrxUjn2Mp0jR0UO/5HrmQ4RtKB43Sd1m5Vh3l/GATMZEvH1otqZPAFlTctluiGRo+Ld4JimuZ64pm1x4PguP+jFGtt9VaCNdFM+UPiUH/fwLm3We9SFns4Giqul321S/CSCbj/0p1pWw5Bw2IrN34ZIZUjEaRpG/Rvr0mE1x8DLMPkwOPFTNKgtmEn8G/mmmcMguoVCD65PpSgkOv+QdnntTWz+loowi4Jf1YLESxR5t2kbxe3LO7x+phkEj+ZRYQY6YfgXryM0fVOGg0CaaTY8LOmExt7TAqn9/YbIHZHXseOwYDKmaUZmCJ6/vZ/YMKWY7mc3UgewdEmhQK/ElfLKilcbZZMjQfmG+KRbvC+zgapKBQs3LCVCOjrdgfrzoXJzwLi4a7bP6DJY3IabWi" +
            "KHkCv9HJgPH1qUvWazg3r4iACnmyyroSVVBDEAg7DUzfNpQOB7nusgTRp85nkLLFYSQT//EltNwm8SuXxSwST4YII1GmLyis75NjL5k35ec1B7BSKTob5ucsMK5XCpxw01hgQa4UJeDeRXSz151MxJK6IoBAxWha8AsMpdyMJxy+Eofx9pxabvOeMX+x4NyGSV0RQCDsNC1pm0B+PxjNS9yjqdRq1RUoDR0U8nmJaSQAAAAAAAAAAFk+t1+hlsYeLk54FgsRa9htSuewWIh/juZf0BOHLj4Gem3bu9MOxOKsl/yJyq7xsQnMszweGdvhifPqxGLuGGR3cM9JqoetxlbFfsplV/bWA5U92m1s+5o2ko2IRFbgfB7rjzeVn2CNMdYXnE6qqSNvrDrX5cAmYkMEn6ZTmRRWq9NmncBSuO6vAsFTp8IKKzzLA243I8AHk8nCPZDhyizDO8ZeL27X00z/VjOXWCSeselOZDJdaqY34W01lHJCCnn45mG+Yj94UhTZBALHRBNILvH98MiWWxP2m8XsFgmpDogpKBTlkr5OGYtUKhB9cszAD8vrr+cbG0nIRCIrcD4lZBZNqEDp1SDGUT4f9Plm" +
            "usMgP5EM6Kvy7dHCYcR+8IFMuUWs02Hzlf64lEo5IQVcnPAsFiLWrZcYZfP3cXjpvYe6K5vwofREQAWyWWVdCe11vkgkf7wLdZYSLhfP9Cq0SwkXhel6FZZrhU4nVdqf7uCDkkkTR5EyQypGI8ZSuahGW0etPkN0+LRfJBKxXoskF/bweGRLo/shYv5/3aURS7vMJ52kbcEBc+C90CSidiIgjFmivKCKj8SQbbg2803kuQ10OmZn6nFHteBwX0bvJ4LLKhUIsDnsBl719FsefSG1sYPP0FsQ2+czwGApXHefpzZyOUwBfs9VMhGGwxyB2HIOGg1Fp+07j5l6Pd+JWDr8ecft+ysu6aQZhkPvDs5fCc32e04tN09qa+n6NN8Etq3UcDihI/mNIk0KBX6qocliSLhcG/eo4/2XYDCaLrULKm5bo1GCDetCxOH+p1cilI1YKZodg3N/z5zIZLrUUaVbT7XUtypQCL9Tgc49eZdGptjV5C0E5dIrgPx+MIeWV7aed7VzVKA5aUQdgJfQtDMwyvvz4vDP4o533eC+jMNisS4lnElPRqbOcm+529HKQeJCwe7RTbp2Ay/0eqMPsEWyaKk6zeTM" +
            "r38L6IRUnQgEg1SzwUaCY5JUNcLIDv7S7k438n/f+6cWejOSDGDxTfsSO1LqA+WESgyrU/27kAed6vY4D3iKGctI7FWPDLMqtZ3Estb+9+Dc28oi9PPsthHfWBNUmpxA4z/e31aKztOgwcgSQyLpwwela4FY+m0NdyeVebHh893ZsYt0QirABLjsLZ//q8KU9Kz4qC11kU97v2mx7ytoeMT2L69Iesfhds6AnMZ+XQxnEdiPkuTBTGJ7mdkkPe3+I0qlw9+2i1GQmx8VJi2/bU9m6gVLYry1GuLPWlKqaui+oFP70M4BSO1oCMDmYxTJQ/4WzRWoJxDNBJIxoGlw9ue8imyXzEywM3zoNfyzucBl3vJYfMeA81IhTt5BMrtQlfFeQ5D0k9+HCDliXdLg8UExPBr7i2avkXIK8FGyEbxHfUJ+1O6lcy47TO72474lgmJ4NOsLzEOcA+PdeOckyCh3MorZhn35FLUZReJDsPJXSw+I9+uX4oi2+piapJQ6GcTwaMsWhYZQ7mQJrxH6733zF9XATqukelZ8VJi0xqm2u/uAT0IYjjzCK887xc0L0EM26qo5dxPwL6wb7DMTLCUG26fw00iN" +
            "1+Zda/LDGh5eubIWH/gg9YQuBlDEbg+fcWvrHZ6EMAGpM3WMqzFe1D/kFP2ieSJlJ8nxcB7wCTJzpMHKcKdxvpQYS6bnaz0OQNgp/4wUyH4PvsP6x3Z0yzYWqWNKapVyjxORGcJe+Tf1Re1NWuo/nugCSZZQujh7ZDfnvQtYLiLmVZ+J4FPiYYCtUuMFKI38bcVaI+NLmTXeFOD1GtCtCcY5BXimWYZeltdhcQlIfLHi1ss6IRVgAgHpFeV3n67RrbAhP2p33LeYgLduuaGmq12fjSSGRM+b/V5FNsVmJljxxrn+m6y9/erNY0G+mXnE76ciFwhAVXZRB3Hs2I5UPsK6UctnHwQ9CtSCrHGvWHn+eHoEXNrJNrI4rzOOBJrtvYZsyUly7iZhXabrvYECkDKV/dCLLBcR+DQEYHO/CurzCZMpdY/8QhyusT59z6k0uiMHSBGIgysk785Ch0zmXA5X1h+w6doas9G61vmbNDzAdXsciTxFgitRDbhAOpKXXHaYwfHbYUo+DQEY1eaMtNYPSI6FXLTPrpYeDfPLM9k6jlWrFKAO10IXAyhiN4nBg4tt0ZyUYpKJX+997Ts668/LuOZOSjFJ" +
            "Bkx+ZC9lw9w9Kz4qTFpj2lvT80CpIQxHtHTRV6FhWTGsWTTaHehyZm7jZRF693ZbyG7TZxawXESbpohcIB1JxbkFOHqINGxFExByxLq53f+/SUYep1GvmdUpd7wc4FuhsPeF5GAn21JUbTC6bld4jDBa1wdlD1auyYfGgmEv8pWlq4lE9fvFcX7VKOdZ8kTKjdy7zix9uIiqFUq+Mo2xuh5hm+mT7OiLCfK9nugTtxd0AapLKF0csyGFjxQxlcruSMOBhBOY0bj8t1DTsvmIiTmoapmNHOG5H4iODORzRlp4mVaDdpeHFgLPKtfuI0G/hccTtbPxoU7/kW/hK0Vn53waAjC30QV1DJj8yF7Km6Wj5/cg2p4GrWpgMaK7sfQ4lz50lH7X0mAs9GY5GMD/ml9Qp/NoZ44kNNmDtKRJ1M1orxt1VZK1h388PQIubeobq/xfW0USH2sNcektKVU1dN/99RBtTwPYCBuoe5+MGcbbfqGjrAmBu7vKEq1mFy36eXBDZgEIKccXkyZ3e/9fnAAAAAAAAAAA6yR2pMkG1xVyTdQvBzjfb7dS7mU43bZfN/+8hj31O6OO+oT8tcFX5unrXHMnJZaq" +
            "GwvavyU1xDmG4SyHKk1OIJlpoovOPgh6+vsut52cS1UFakFWttksslo65qXevqKWIqOwJqgpJYBTyFs7Nq0VgbEekAEXuHWDxR86Sj/laTDgGeHtzzYhveyBHSWR/LoYRFt9TE1SSh2o2mBp3K7wBVj1zHIwneMp1MBiWWt/9XDOIq0DOdWfmFkc2ZdHAk34i5DFqgMYe1T2Y9J/w1bQ8NhYnpE1tW7VNTCWUdPWehwS+WchzSZzLtKMHD1EGjasSSqUYWQHf2ktHXPcb19RS28KcPQNaNiKYLSzDsoerEHTZQnYM4WYfQs9l0kGMPaonszJCpbEZXeiDuLFrQGofOSatV4OcKPepEKcoYJka6Dal7RG25Yvaszth9TX9t4nKrgYXTelPEafJdzv4VvLpsGcbvn+o+tTp2SjkxvYhM4v0lkLgXwQ9FaiGm2AdDkz5XOgu3nvDQ8VXAygldweI2wsT8aU1DfkEDZN9iMFMpHdMt/Hg2xCZwMmPzKZvO9uZvjNauV7b52MNa4rW+IWWTGzwuISkPh/k70gJ7+RUANpRg6QIg0bVimeJ2+uGdMoY5KMPFOiQy9wgv746Rue0LxveSw+7UD3" +
            "TEDVN9LeU9t16L+uX8KyYk2pwNKlQf0KTo//4Dz9EmQmIOSVaW+n4+Hw9Ai4qY9s0aojD92m2cLH0BCd0cYoj4p50E90h9WFRpRXm6NxC6I4QX98+oNPaB1HpNsKUAflIGya8UYKZD+hKN33NL1HEoFERwZytyMt8uCGzAIQUpMYLeWNvIkrV8qh+bD4kx37a4kkR8wuWun53RGFBCCkO0vlvraKJD7WVYQlXxnI1l07Z0BOYz+gBqaNtnZsRyof94rHmrTJfiHDU0QuEICq7JpPnblXgucUBbp7yCybMiAxpUZl+LZeT7G2Ufd1R/TUi/oNhXukZoKFqWxaoWqYu5kPrvkI63nJoV43okf0pi12hX3NXSd0HvjFC4AKGCC8vmXcsgH3orRmbRuYb5Qm50zJIb9TxOZIlUEKD5PZykIgzcyqZHuk70KaQGCJChhxDE6k9psys4vM2jYt3jVM05bcI7x8Wy+pwwm7aKqFGrPSYTGnNkjgEwIdxSlB/E2yzVrat3BL5IqneWXZhO1x5jI4b9YXNLuk6C1t1TirckVcIUfqYXe0sV2hq3DPCRzorJB/znK4vf9XyF39lyJ4qKTkTGprb5QN" +
            "OFGZW08f3+RiV4zK7XG8ntmIK7DAHSwKkXudXRE8UDuiwx4RqHZDxuRjySOjmcHO9xaGxX6odtyHtKlz4JbVCa8NVn2dOlgUtAwqP1ncxvQ2AviEldEh3dPh3T2YNkhK+UXnGqRmiOV1GFR+sqWR9ZNmWHRQwB2JnqgQGGWMBltPVAgMvEYDoy0DhMZRN7893DJQeOyGHirqMKj8eVc/9yFNIDDKBQy2ZfAyK4AWwwxpvpbdGyRwh9uV7pmB4WG40fwYFNnKBfiCDtK7zA3nKWPXYFBDDxTHO8yw6KCdOg+OQHZNVz9UojnRdcHhYXe9EvWjfHNPH0urN8EvH9/CbVZIsWc5XNDxbATtFTe/QqftlxYdFDBAZX1sZ9qrcrgH7Bf6h7pO6Dzfr3nLAwT7wXM/BgVxvEY+eNYcEofpiifQfPSOd7StobnCYlNskN0m4kSbWGCAFgWPwJrX+UH8+/rYzqlL5G0Oo0PyiwYI65+bEmvQSRc0e5qSh0rnaZwiGwF8QsTmnuA6TFxyDuOSVktun14+o5naa6NT9FrYPTXn/uCQTBskJSLQCYMlh+ldhCmAwA8UMOLGs8Cghh4okwh0M6QZ1yny" +
            "NB89rdQtbG/uCj+u+7Kljkruc8SQ3TGDqrcttbGhajSpKgQGXiOP33tLNaFoa2/MaiO/bvSmlWwZHLlrhRrTUlXVmNTW3jUayWBN5fKufvMcpsKjqYHhct4vlVGtelOYMCWq/1bI9hYVUh2dHihg2VBv4xz6RQc6GJxV8StkewsBgOyarn6oWXzsi0AFDBBeI1DlGYv5QQTvitM0VcwN1wenvuFtZ3+S5eMluQ3naZdaBhWRom5jerYR7xYYIItGCfTfPrepgaseuweK6H2swLeRA4y2XiMfD9ONRXSwVmBn7fcCweqOvrpfS+CDEjjN48R3ws7+vlwNzkhsNUwb0oxds2QWwxkQJuqe0adicyQDnSmz74Ll658o/ILL8q4CqKronPBdJ4ZDGqz6J3SwKM9HH54xt6k4WBvQuOOSLsi8eBmbQAvvBpD7cce/QvhiHzvrEEYDBJloPnpHtVrY3piPQmOmldGQ2AjHKm5jhFMGJ1J7wxnXy+uwRGbXKZeu5n4MCuJljHwU0vEHsFbIgHEiwywwQAuMinrhH9Xaztug3ts46YoOdK0Qk1TcxhWmC+kaF/ZVzBmN3V/+uL2xSb/lMCiviQrt" +
            "1lum9bStemp5VvCIKZcifhDoZlUys1L5DlNh39rO/jnOx/MEn8kBYf9itWFnf18ul1zPJtIlh/BR7w+GVDuvYy8eQe8Qy/KPUnImNbu5SoiujbrnM0TwTUEHadNmiP2as6uU3jS7uWaAExeSjfGqm6VkoPDFETxU8THUvr2xoRd/caLz6o71tUCHhUnI9lXDfvFOaUTwXezURmPc9VE32PKs/Q1SM0T8AAAAAAAAAABfvG5ZjvVRWhbPNC7xqoUysDa9bds5XI0TdU/m3TG3Ervfp3otbJCUiefIrDpYKzA8aw4JzfpFncSuBYnH4mUhSXNad39f1GjK/WRWHSybGNoVAgMvn8nhiGckNpQmg2k3ghQeO6+JhJy11TEkcEvp19tKbxrT0jOm+YlDKpPZv501OauKDuOwU/LKrxXH4tFuGSg8dkMPFT3r4pNjhO3EXjyCwyCL+QMzuINMuUoT/WRw3rEuaGtVNZ/RN3pTxDZhyqV5AvNZdQQ6l1KC5Zp5/X9wSCaDEpzFLukTaZzNeCi5/w59rI0dVFV0TnignUPLfYjMs1IzQUS9EhtKE8+6TUnNJf26ThE+dssgjAYILz/2J7oieKB2" +
            "wolX8gT7supFPf6B5G1n45TB5pU9p2IbLINoXP9JF2TzLBGX/E3spSsk1r2SLmj2sit4RJrFET9I87bt0SF8MS6erXW+tVrWF0/YtF/ULWtO1OSWEjir+pLmtO7+vrXQRqDXMgvvgghHIDuopZEqUST3W/jmnj6W8LE4JBPPCU7+4ln7yQH3dydqcksJHNt9vfj1Ae51R19ZmzwiTeyGkW2EAY+Zwer+dJi45BzbOazgWV5xIXxbtyqkOic8UMCv9QtD7D9UO26Djj4hYnNPcMCUkttFB/9Ycr/qn9/C7mcRaIrPnM36oBqBkNhqmDa5esvZO8YVx5XHMyw6KGCAyoY0RelO6H1Q9pZqX9DW3oXprYFPltXaHHCiL7aePqPVCmn2jVgrZEC4Qo7Jwu51f2BKSeOsjfEsW4b5CwwQyyPh2bLrjwLz7ik5E5TT0iVEyOChf1zQ1qq1jMal96JurYGT+wgjjwLC1caPRlsvn4H8/5zSiP26xXcFkVfzWdxHHSYuOQf/SSv7WCIz5ZrFV92yvOJC+LZzJXe3Ykjgls9vmcSm2D2nTMEUfkHreVcB9IuvdpEqkzc+8p0kmywKGenhYyK2+GIv" +
            "VTaZQEd1f3qfTVbVpHsLM4IlZ0ZqoRdMuPUFfesIL7LMSMEL9EdfUzcwiNQnXew6lo9DJRgK7RAXPSMs9wFhUa5O0J+Ub8wT/UtHQcRTmHMbWz8N2ZM3ZS/8sJZ7ZEBS4CN20gqJhAyjrjpwMpsY10GcvSM13oUm+v6/EVt8MZkDlwdPhaqbDcWK1PtINrlwvsYL4/xBBKge/zbcS3CHchMf3DPthFO2CETjPjQXZNMP8RtuqzjNOWQ1Hwp3YbhaO1aU9QnPug4whXCEuHJF0Eevs70il6488rpcL29rVUp0vcR2H09w4c/fxkRx7cRe5hB4TB3ArxZ6yinWPBE/KC3tQRd2qFmvrF8hHpmj1e7UhPlJqH7zOzzjbKWW4BPk0SDwmDqdQyxrxARk3Fl1Y2nV9eXRlWyemulfBDaYuyTJ7MjaZqTvRNaVCMilsurGxAwiNcBQO4A4wZO6jGUhAxzux11GvJ6P0zEBGTdRWtHY4uVohuylD7E3EI1XecmRcJ87aQXKQgZP61CDFoDK7+xFavMkG9I4WNZzr+GBq74kL1Tnytm/jAIR8YENzBn9kLxNuw9DxgqVGERqnaB2HaG/y/E/VwEq" +
            "K95PiWHhcrUnuFOoT3MkgbCx5kPfH0thGMw4Qlw5rGjSt/fXvzfYITEDhkowFMcgFKokY3Kr+lxuYA21TrrFdDlHZXQEA6PzCcIV8Lxx5iMqWLlH6YfwRXtM3xi0d73Ylwm165Bsb+BzCDwmgGDZC/7cQA5B+QN+KElIxuRL6bhyjsroCAZb+wYzDp4XSSsaWVCFYWnnKU665PT85sQ2T8p7z5XjDnRJfX/RhqM+lsJSg2EQ2FrWkE36oQIbTNMSkTq7dYclRPrdRuy5FA8VGD1lmmsehpEUwj8sq9cZEJrXE/4GLdRoNtCmBlay+8HcIhxaed2QlJbv0m28obFJNQ537aAjXk/Jy/05W2to9rkN4OrvpvTUxAQi/x8ahTLn+Wm4Xt7WqpR/biAHrvKPPzrQYjuBqTj+ZiTui3qtoae2gujdyFZge6eMxW8oHiowx5slekX6oI1bQXTgZCsws19ji/9+rgJUS8mvnAwF+AjOWTCK+YtGro/FjanMVcOIgDSWx2dtDrHzPKrh5w3XurtiAjJuorS/1QIPhyAYccudXKdUqbcSzoQWadh96DxWimGEeF62c59CC7pssHQeK/EtW2Dqwc5H" +
            "dqw19xKDaRwsa7fZ/s7bX/zNsY9MNRqDH3nAEsMWBYLwq62uYqdMt+GlgByC7wb8Z6IYRfLLI1dRFGZfXfBNnb9A/S10J4ZYoDk9P7cxg9oFpAnRkuOwF6n7KM8LQGX5JamiKUK/PXzbdeInA0Y+ArMm4QxatdBs55aOgpWmLea5c/OzY26tQt9XHTgZwwzl7lSbcinXy8USmSr9ZeLRRvjvTpBWsChktwQeE0Aw4ovALt0q2tUJZ5MrSvSK6V0Hb+b7e8bcR4Qjmqy3VfYWZkAaS+29uAfWSF6o04mvYwWkG8IgrbSxPXU7MriXKfIRmX5YS7MyICkdaDGTztocf/9atsDJn4GOFrvV4n9n46GlnTTuJdIzzZj4roU7VKLZbfcK+ssQXnl5XS6ZubukJY5De2dEM0F4AYb2zohmgvDr8JKjuzR70rzX+mLxjR1VrdnX0BHFVx4L0+Rxsb3/3qpsL4CO6v70XuV9MfbIgKT1D6R/8ET8oBrdycNR9bWV6nZkbTNS+SIAAAAAAAAAAIWQnxb1jr6mRilFc6rxLMwKVRK/Odt9Lnjb2Fcx3SbVKc++CGwta0ghi102WDoPmxUs0q36zXis" +
            "g6ORiOLHlbzDudplX3+Sap7LoBssHYnDB7X4UJ8vqep+6NbJJpQNzza2fhqvO27KhgeYWXAkJav7eEnf0xqzaUx8V8yTKlHi2WQTpg6KJ/8mPqVmxxWmcWxx/DRDdtyJSk9ZUoRjevja8xTpiyC88lcnaMFKuWaHEIjbfGguyLuIcHX5U3pqYi56RljzAsKiYZEW2+WCCE2ofd4BgybnCdzAGnecaZfo7cOcPax9UMimCjOhoHiowMGoK+RSs4uXP3Rr6hNKiOmiKMy+uv2aJ6vq2U4GjHwE9IlSsXgiflBc9Iyw+wSZWWAX4BVt5Iq9RDi08qc9NTGMUormSf9YhbUV75JN/Pt2DGYcIS6SVjS0kxlcxZp5hpzaUZoh0ZA+MpSBBbW+XC0ZSs6M1F8umEONTKI4Epzbm2+pyr7+OdSBsmAJ7wuMQd7R6/aRpY4VTm2mTZ7mSB9UsG+OzxP9iknYXh0ByeH1r8gmURwJTuP2mKMwde5nrVrHgi7sTbJDjdR8KMGZ2nWJ9oM32xzoks3ON8V8Id2jUwWX3lA8VGBqQvKqVD/3k11yen5zYhup4jKHUwdFnfFWoZ4Pwt/kd8Yd07TNnCJ9" +
            "5Yd/A5hqNBuUnrKkFcb07WIGEZRgKJNAY4DnWuhOEbCL53K21tDxb1CSkJHVls9t6GeV7D6e4N98+SdIK1gUMshqPhTuwm20cRnNp42swPbkAYnNEAy265KtvDoCj9/3sqAXwtLTUpwgDav40FyNazSnj5ui93c347RxnY8jHwFFvkI8L1u3wfceVf79iOVdaFMDK1nz7m5ls+nE/wc6qncqwzma5evsh4Ful/hCp1sRDi2y4EhKSzMSd8s92N7dvVEMrHnrn6U1IXlVKpH1x4qwqWhG4GptQ8foC0vwszoIybNUaxYe5TnxwjXrqZC+wb7yN2YGx7IsIJIzYUVpqusBUjtvwyialGlTq5Nazt0nKDj2PhM0DosEVeyhK6BSd6GyxJeP+KKlUSLKE+VAhiJ2E1hi0/HN243f3gi3bP5dHhLInkoXig5WgWsDlphn7l95lTMD7Vmv7XSLq3jXHW2Sny35PlPu9dio+Lp5jCr2GbFpjjnPa5Xdry90kQTi7CqcgOCIZCfOXI/YgluV6sTg2Zk6xgJxRpnDpRcwdvk9GxUfUKKfQp7VBeorx1lGNGZaz9x/S5hhsftTKSNC98chwAgOhkEw" +
            "hpPNFpb9e3SHJzGScTaxS9NEbIpjoXIbZpo16KZoDkrKtljyOVCaFqTl3k70Loq5N6dDXug/CNkTTmI54mx/loJ5Gjwt9nSIP27wCoMpFjyOWn5C/etlkVyq7kx5gd21GfI0eFrx6A0lXd3j7Zi9cFCJijKpnMysKMpFGdpOZlauWYgPTLMdIg2XmPo31tsmMvlo8LT/zRqgDwlkTyWFRfo61RdeJN5y9GxUfF2yRhVxPoD7/w9+IHhDzytz0qr6vRfqNq7fYrT9ERus0W+Sz0q6p9vHLWfgs0FrXa1J+tO8oxaySRSoixXRUAaK7PkU4nwd6+Me/EBP5Ix1m+2iI37c/RQbUix4TlBw8XwmaBzmlsrBWBXzvDXSpks7tIGngAz/Kf59/fYe2frD1bqksGwmY6ke9ZnRA8EZkTRAQ0H3rU3tafIFVM2dlkm2G9aryMO95+rbE2jRMYmfsCr7ZR0Y41Lh+ufx2jkjWu98psGhu/XgqO5PepE3eAXPmgseMThxYYC/jlvZ+DrL2zzlgAJ15RXTi4l+Ry0/IfD7vMYtlG63ho6jlbo8JI0hlC4J5yI2Rb/eOYP/ZP65AuQbscl3QWMNENlX" +
            "w8sXIrWNTsyieuxxnK4MO5n+y1GkjBX7FGWsgm0nMyvhvQR6116/AXn3M6+UGWDFZy7JbEGjxHXCf+umUkaE82Tv0P1144c07Z5gBAdDrhj7jimTue8UTThFPrEMYlqBaXhIB0I1XBJIz0LOFKbunhysH9YGMS3Oe4LWukeS6budFBx7H4caB1YWuA3BHEouuEnBmPIfp3d8qRgByNmlBrE0jkh+wnOtQbINHph7OkR0YKtVo8+744TmKANFdvIKG4fRbYl6YXMP4n3v5F1SWIPN5rjKPb63DCNkftAdERl6Nio+oFkjhLYfQPPxiT8QddRX0UQEcdxFWNo0I3A1uNymEWWH/CBDjZtn08mrJtArC1yI7g4lF2/nejgqtdqQJpzEctnY/jFjxB5G+qjLibervHcWQvUvfR3khS8SbzmoxrowJDOboGAFB9fO6IjIj+6Cxhogr65XokSJJteAEfyl5yg2pFjwByvOu49LTL1Je75K820koTyv6Zu3aVV9EvqevQWntanowEuqW4Nr20JzFI+sO3kFkIOEgShRwSHlV9NQbFWw/XL/mWrLTz1hPtoMjmTi3APwhoNW5rlJ6QTq1yq7Cw/8" +
            "F6S1E1lncGrjyOFvBNU2f/hPMAKNr1cMGEbI/L06IjJbgSD39sqRCNRvojHs6j6mM02UdFM0ByVYQDlmworSSb7W86eanyH1aMy0g6X+li3QhXUbV+ExWv7QAj3lL9GOSw5bXyDmrd8aMy3pbrGrTKPOEPV7ZcYEEI97qNYsPNerB6OhEHPY4WsNrRKRvtVs8vNmQzUywJcuVXcmss7g1AAAAAAAAAAAywKkdt6bUCnk4y/Ui556wnNLZe4shPdeblOGvM1+EK8BtPyE58vKP8/oc1xlkF/VNhO/2g/0wuYRO4csMef26C/hi6JVBSrr6XS3LrxIoeQKvFZBuJ2Xm7RqpeYiArZuROwmsMS7/4emkDtbJ6UDx39oAZD8meZHl6hKOqcajZzdEu3hYDfqfMVUJR3dDchOiMVMfZVr4xNNkWlgSGYrXbCAcsyZCbmStd5ZYsXJfFGBuAOtGbY3ybL1l9lKgjDsCwiqxV9WXaTxMn/SAXKD1q2YkZ54815jarlRlnZ1H1Mk6SFnClN3T7n9PRwV1G1IkvZhlPvaSF9aNdxzEQFbN97T9HBUd6k9wAoOs4HNDY27iNgJxl/kNhYQSZe+rLpV" +
            "IbcKyVaTsoxZ9MXiJUEYdtXbXrULIfSZVdehnPVcCW+pcka0w/hRn4VS1IeivTg1VGNdGBKXw1Ajwu/chRg78p9h+W7MDJN5U0iTo53cj+1e3wtZqgpUy6wsbRqfOJRc1667oNiqfecqv6AMCcXvKNhMxk889y+/IAP2TbFYeLOnJMffwG7J+AafMj9ogIaCzClqzVHQHJQFXiuuXMDFw2Jw4sIdYwG2O4QnIDgiGcDS8JAOhGq4JFL8byd6F0XSxpU8jOlNiw/gCfj+MJV1PmVbLHmSKE0LmEo31UNH38Tqta6/iAjipZo/0sCQzFa6nKDg//hM0DhMJZXkr63hYt9nCPSzvGMCv2IPI31U68qTQp0QHBGCYAl9T9CM3dTajC+bVy5g7O9winx/GMS0Hzow26Tf6dP/QAbxmn+w8Htfa/fdTcGe9B9tBkcycW6P+fvMhmpknTMwjI3lZ3REZIlxsPlyoCks1hpHJD9ht9jv64UR1MgnZpYctr5A0UejqrNfJfe4Et52FU5AcEQynVE9drZOVwaT80eax9L5Cqibiy5EdwechSl+uZ09haxpfjfmLfx9QMN3byWk7pOeW+BFyFDdj7Wt" +
            "hu1bpxH/GVLpHQvZz2FrNTfgqyVuQI/7lgf2wDECWnoLAvXhFtI8nfPYSGv7UGUMYhz/J8QIdfV9QMtx+l/TSm2qZhbaopBin181SSPshOLshHw9xQfDswJaNmgEPOIFqL+ebE2sCxn6gIvi6b67lLW5nFJ3x0+jeNm8lfA5e8zjMuUM260mJMdPzhKTMnl+Fyns6y6nCavC1rn2mVTR+F2JjL+6uFUahZp2+xfditsb6FiGNi9/tfZBP4/xNs2K0xEPpbu341wKL+7VFMxNEegwEO3Nfxq5oedd5V9C1YHu3kpVwTshtvL1U1/5ThSADMG0bRiIdh684V/bZSmROy0l6JdacYHCcYF/HOLXpVQuUsXLXFMSS/n3pr7vnCgdnnIufSHy9W7OFw2bgdyn5g6bggUctJQbHnEvYjxJ1zMh5Fz6Qvn33MuOen+Lug9gjpiDGgEPtkZHTM8NjolbI6mShVhPsnqVjMK1cgUzVENC1bjphO/zpQEtGzQCHnGMV6Ziaq50GAv/GfwG49gTEjW6nU1qfG3+ydRMF4+G7WVQZSPmoC5SiAN3LVwGIpOJiwH0/gtpHsD42r2K7YJZkUxOOuyYW2e+" +
            "sQ3wgn+/lqlqaSea1Pja4eeGidzT1f8ugS4aKx+lU9H7rZDW66DKGBrFQ7I0MQ45FgT33yy5eCemJBxpURifAnU1E8zqr3xeZPKln8hMTvokfSseSJ9fWttk1xirR0xIefSnofInCkAVc9qDKpvrrjSXhnloYhxyUUg40qIwIwTwr2U3/XL2hR0GAj46a0S6Z4WIw85u3XNmqJP3zHCs/9TSTim17anfOFYyFHDqamwHw0GMDlpKgyvLsi9WNbrNBLRs0Ah42QoG7lq4DEQ7DzshH0h2yPnlCVjDiRLu3pjRSznNv4sBWTl7KSBy9Bvgh8BAkxPhaN6tJumIR8qjn04UDIScZ4W71f9VHbfz2FOgykbRXVykDc1gIMeH/jRvhLdtzxXD+1fe/aD8oSHkzkuNe2CWAS09msZCrSmKLGQIddi9EPCvFLNXxup7g3SsTWMh2JpFFjLtqWcJxxmyP/dsJLvzKLwGxmLVJpEsCPI84l7EeJKzZrl4KD9vTzm9wIyPnp1oM/1PORewnnn0N1k94G+ywIwQ1oh4QbHRS9oZsm7uMhOdsLSUh2Z12T4vglk3dxmHwFiQ6ax4PUZhdfGCfgP/bIcJ" +
            "lF3AqDU+uH9FFvllirW5Jj+Vc5h+sCDvuFUzC21RSDEq5qkbVCvLQWMx5BPGFgR5QI+OgYDTEaDv81FhwyVQOtBmIvm9lXDViHbZog1LjUmlUzE1VzoMi+Fo02TfkcQh9BsJ5/UKL48SsJsPJMGhLdpJzCypWT3EH1w0Vj5Xpr9U0U82qFaLgq983+BD9kGa6momhclD+Lzl3L+01+kdK7J63d55nQUga0Q8rtbmq217rpHJ9hvoRT64aKx8rlFjEce2UyLjMqTSPBSRuamS0I+1mC4DEcfKcKxkKODJ1NiJW8KWD1X8xXZCPpDsje/Xb/BQft6ecmc9z0XweozC6kqgYFSUH1yxWBD7W7De/Zxe/qHjvJrGk27dS0rcgAPrdBgI+OixDdIUXsG3KIWaIii8n3NQFylEJwoGQk69zNOXKu30Mxwr9gWZd+QKZqiGJVAwKkqBLtbdio2gpwN3R8UV+HqXDpt7MCPqqWAaxXi346o6c/utpg+2mTEequWXAAAAAAAAAAAxDvGdYgS09CKTcaZE22RVDeyvWRqWB5JcpJeLuKYklhwrGQo4dTU2QaKVtYLNYCwyedzBZCYnfcGhlKqfdkJx" +
            "E52AOybf0KGuUcTUQegwFtgT+kStZd/BrAvyvEXU0hMjvmqSRsUV2UnXTQiSPc84nQUDISfQZucvf97/Xk1jx6R+KgFVJH0HmbFv8S+ov+1GYdQ5jJcqr9/Qu8ijP5VC3KeWlKUdBsuwIOu2faHnJboPBWNpbao05PGkgNX3bKfEOONOlRDq95OegSQ7ZPL8je+uRgctJc8sCPOjWG/wTtelY3WzzzpWIMlHzkDnhlBD+KPdhvGCKVaLeV6sammHgAMBHx27Il31NhLT9xReAxifddowDew8lXDbnDcgyfO7Ih5Xa3PbuHL2UkDk9TbdRDviUYiryKriH/442bNXqP1Dym7n5PEXyqNhS4mkfuz+NOcy4cZinoN0LEMbmbHUzzoWr4PC1mqq5agESZDpHCYnHXZMo71fkcS3TD9YEPl8bdBF+EGixn8a/Rn+YzFPyPlXI42YnOmnCQddUwbujlX8VAKqSPoOSPpWPJAjvrRl376rylI/dmyHfSLYvOHuzE0784XgReO+u2mzYRVzPhDqrWcg/UMots6xDnHl3Cq9zETvZzfgt1I/FY6kErCNmJx0xS22zmGb61mZK5Rd6Ios78oJd29M" +
            "o71rjVt+N4TrRz2xy12JMMP7osKbSqB0nCgYFSXOF2toMxHy0MQ45F/Tute+hLcf/G7RWuX6gJs2zbARbF7+dymRhEdSCVjIopBwuVlgRghTEg66pgzBAToMBHx01ohpaR4KxtLaSWhz20l05utHUXqDiv30BZnJWkrNM7TiH5lgRslPwDSX8OarkujRy46iM1TH9WY4VvHZPuFwr3uuTWFr0nvCKuZ8krOaEDl6g3CryLMwS46YkL+WcodjCwKyW2fWB7b8bhXQMcOXzlU/5ha6WwGwBrUlqJut5ilucMhqH1Jdd9NDW24QNXBXPfoLZg77Khf8lat2Mnqel2NL9kutnWRiRYv18YMMrtvD90jFyPVCZpEx/5UEShzcSLDLiSli3zz4uGawueII6TDBNaFPs/BhGnZ8jSYF8hwWATbWtxki/sxUnjcIlDilkH2LC12jjlgD1JxaW8yc6m88vO2uJG07c//l0rh+D94i7c5eVKuxyoGF7B3n+I/oBWG5rV4ahwE1oIwvKtvWZc7MdleAtaeC9YNYPtyKLu3kez/J2Vw1Br7nD4O+ER1sTgXupgO5CVk2dBAQPIG0gJ/eXSxptgJ9DHdK" +
            "OZCA19XIeVMJ1B4WSHQGtM3WOxgmUF5f+Z3C9JsCmOic0FQKlDy2f7yoS3+JHxfFcj0ds7eN8qZ4qm5x5ztPLhQz5pmgcWcNhPIb5FRiB4KY3zMntNIPL/BJ3OLTdp5c22xgGZZW63pkh0ayB4tHgzLNI1mNy63PHqSVW/DH2oXpoUNAG51Gtf2Spdm77CG4yBOMeQ4Ljhsu4AuabXulYvhXEriTt/H86yj+2AvqlJ1WSmXrikDqTGyZiOhHSigjRTWJixIdjy2r2MAyMazL9Loukcq5hny9eWC+Pe+OJjoMEal3YC/W8MtQ4a0WyTUn6uIulANf/YkoZtEvXeLOGv8bGEGrm/OQn5M53oz+DUOWRyfIxIoL91JFAsaqrlMcm5xe86wQtBNPovpJQqsypT8WWmLlURIrx0FI2nbm49eSSEDl5GSyp9NyrkPWl4TaIztyoQXhGoakigSRSUGmOLS2hSXJ3nhl3eq6rKbPgAIKl3PCULa9iMKE/7tevTOTi6DfRyyPak4q72y3TZUcMkJ5g3IqMY1Bc/fN/784m7IHTAr5OCwCbIpqDwskOgNab9rlPF+Ikx/Gi5iWflOKw0T/WccaqOY5" +
            "4vzgzkOekimiDN4kedjNQBnon6LI69jp9Ea7z/OYJwxDs1M+IoTkVdgvDc2OlFBGUQZvErJs6CDnOVeva8VCbQgezlpAwW+gOxk9T8W/q3t/5mSI3xdNQg6YFO9wWATYgTeshXw518axczJE4YWoIWlcP4lvEfhn9s8GV+Pv9SQaq/J20Clj1S2jZk51uR5eAom9mBB30iiQwf199BNgjzxVN7b9k6kXqhIQfjkZouAGhtq1MJlreNqmsFWe44Juw04v91YIWodtU1ikT/9BN/xYdZWzWUisfKUJXMfV9n77FH9si3VKwL/rJquR3az5aJbvxWekkXPKmjHhHnxcM7vkQYaxMxWpDdt5O2iav+RwtKArp/ogjuR6OntzB/lRjOzVvhSjaCLu7Um5I7FE2Rdwi024s9wxYIghnydl/tOz+o/c8fJ6CZELLTH8pgmbD1LEo3jtbcxQzL9eutmBNGvVghF/ZipPlM6aUNT92d8rJbz7RSB1JmfEK2YfSfy/SSQg/HIyWd0DQ23UGMK7PB9uRRf4crORoIVjvGmvH2jUPqS67ruGtgHK0EwItWkUrJTKywmAyZhUw9hzmjc4ZCb+xcAtusrC" +
            "3qnXeL4NOz4ED2ctIO65UOWw6jd7spBF8wqxNsu0JWBiAZwHNxIs++hrkwwTKC+hzBzrVC7lN0tTj9KKohs6CBthIjrYnArBNsJEdK0lFJ96I9Pp90ydBr4h9ueZaMXtz1+GgDYnjHf3BdYb61qcME0rR9FS3OCNX557/cI07Pgkd3hYPc0Y6oZ7pnxEFdWqTOGXnVppiZkAAAAAAAAAAOxk9CEzxpbxtXxVacFrEXHBx5JvRn+Ir2VNlv4PPi6XFfk21ajEDhm4pyxSqfGulalRfaoh2xncWNJxBPoY7pRZGKFI8q2HgFzdFina9lfEgnTBUWT7bPrR+xPbxuBW8n1v2RDPYJ9qtj84vdmpqk09n+f69SbAA3S7xwaHFJne32MHNLa4Uio60+0DzQrCb/reryCDwCPUwA1CI07K4buFOMuoXNdulsQCJQ5uJFjrR7w0EwJqXQWv16cfEUJypJeN94TMP2LjuW38HqFEx4Ehss85FZbIrjGOTo2VCRbzzpVWzD6S5WM4WlCb3X0QRzWBKaC156+j5vOH42NwK3ngdV1WU+lAAXvpA6X/+fQSErU8LJDoDHUzB/MVhX7E24+vuGoMYdMe" +
            "2eXdgYYhOVJ3+KrSn9Yi4iW9qBQ1eHH+dXEXSo+h8MoTf+xgmF1lYTBEnsGdvH/npUDU3UH0zyzcIGrgrnrpFluRHNDi2lWosjBfkPlHEx00S/nsvVLGt10XxmXSQz7QGCJP7sBesf2eWemShEtkV5pWjr+kpd0Ho8YOaHFtpFR+LLTE16IkVoexdjBMoLy+QTrupjLzNn2ZFeNrvGdmO0DwPuo6Rl9pHC0ow+CwCK1OaCoFSh5bsQXFt2EoW9BE4b+NGltcKRXywGF6wwFMdLf16PHRHMNZY8tMSz+nRe+dGoRGnInfa+M2MIJLK/s91fR09uYO76L1jGuD+y1OGEZ25F8K3zQRIHgfdR0jobq9Ypszgap+0a4dd1MZ9xuw/tHIDaMumoRVCQg/koJRcCmsAWNVV6cOp8lpRVGDHQSOZWgmBNS6ChH2UfiIKrdJ133JbvZ5PYrvJ5n1KwQtzUju8LB6hzDJIvGi7Q1Uc5JhQvHTL9CXx0pnTShq8OLhgP18yXSMvtJxfnBnr09JmpOCkKns0duziOOykzRN0XInNBWMJQ+j1g",
    ); //==

    // Variables
    var sigma, N, h;

    // 64bit tools
    function get8(x, i) {
        return (x[i >> 2] >> ((i & 3) << 3)) & 0xff;
    }

    // 512bit tools
    function add512(x, y) {
        var CF = 0,
            w0,
            w1;
        for (var i = 0; i < 16; i++) {
            w0 = (x[i] & 0xffff) + (y[i] & 0xffff) + (CF || 0);
            w1 = (x[i] >>> 16) + (y[i] >>> 16) + (w0 >>> 16);
            x[i] = (w0 & 0xffff) | (w1 << 16);
            CF = w1 >>> 16;
        }
    }

    function get512(d) {
        return new Int32Array(d.buffer, d.byteOffset, 16);
    }

    function copy512(r, d) {
        for (var i = 0; i < 16; i++) r[i] = d[i];
    }

    function new512() {
        return new Int32Array(16);
    }

    // Core private algorithms
    function xor512(x, y) {
        for (var i = 0; i < 16; i++) x[i] = x[i] ^ y[i];
    }

    var r = new512();
    function XLPS(x, y) {
        copy512(r, x);
        xor512(r, y);
        for (var i = 0; i < 8; i++) {
            var z0,
                z1,
                k = get8(r, i) << 1;
            z0 = Ax[k];
            z1 = Ax[k + 1];
            for (var j = 1; j < 8; j++) {
                k = (j << 9) + (get8(r, (j << 3) + i) << 1);
                z0 = z0 ^ Ax[k];
                z1 = z1 ^ Ax[k + 1];
            }
            x[i << 1] = z0;
            x[(i << 1) + 1] = z1;
        }
    }

    var data = new512(),
        Ki = new512();
    function g(h, N, m) {
        var i;

        copy512(data, h);
        XLPS(data, N);

        /* Starting E() */
        copy512(Ki, data);
        XLPS(data, m);

        for (i = 0; i < 11; i++) {
            XLPS(Ki, C[i]);
            XLPS(data, Ki);
        }

        XLPS(Ki, C[11]);
        xor512(data, Ki);
        /* E() done */

        xor512(h, data);
        xor512(h, m);
    }

    // Stages
    function stage2(d) {
        var m = get512(d);
        g(h, N, m);

        add512(N, buffer512);
        add512(sigma, m);
    }

    function stage3(d) {
        var n = d.length;
        if (n > 63) return;

        var b0 = new Int32Array(16);
        b0[0] = n << 3;

        var b = new Uint8Array(64);
        for (var i = 0; i < n; i++) b[i] = d[i];
        b[n] = 0x01;

        var m = get512(b),
            m0 = get512(b0);
        g(h, N, m);

        add512(N, m0);
        add512(sigma, m);

        g(h, buffer0, N);
        g(h, buffer0, sigma);
    }

    return function (data) {
        // Cleanup
        sigma = new512();
        N = new512();

        // Initial vector
        h = new512();
        for (var i = 0; i < 16; i++)
            if (this.bitLength === 256) h[i] = 0x01010101;

        // Make data
        var d = new Uint8Array(buffer(data));

        var n = d.length;
        var r = n % 64,
            q = (n - r) / 64;

        for (var i = 0; i < q; i++)
            stage2.call(this, new Uint8Array(d.buffer, i * 64, 64));

        stage3.call(this, new Uint8Array(d.buffer, q * 64, r));

        var digest;
        if (this.bitLength === 256) {
            digest = new Int32Array(8);
            for (var i = 0; i < 8; i++) digest[i] = h[8 + i];
        } else {
            digest = new Int32Array(16);
            for (var i = 0; i < 16; i++) digest[i] = h[i];
        }
        // Swap hash for SignalCom
        if (this.procreator === "SC" || this.procreator === "VN")
            return swap(digest.buffer);
        else return digest.buffer;
    };
})(); // </editor-fold>

/**
 * Algorithm name GOST R 34.11-94<br><br>
 *
 * http://tools.ietf.org/html/rfc5831
 *
 * The digest method returns digest data in according to GOST R 34.11-94.
 * @memberOf GostDigest
 * @method digest
 * @instance
 * @param {(ArrayBuffer|TypedArray)} data Data
 * @returns {ArrayBuffer} Digest of data
 */
var digest94 = (function () {
    // <editor-fold defaultstate="collapsed">
    var C, H, M, Sum;

    // (i + 1 + 4(k - 1)) = 8i + k      i = 0-3, k = 1-8
    function P(d) {
        var K = new Uint8Array(32);

        for (var k = 0; k < 8; k++) {
            K[4 * k] = d[k];
            K[1 + 4 * k] = d[8 + k];
            K[2 + 4 * k] = d[16 + k];
            K[3 + 4 * k] = d[24 + k];
        }

        return K;
    }

    //A (x) = (x0 ^ x1) || x3 || x2 || x1
    function A(d) {
        var a = new Uint8Array(8);

        for (var j = 0; j < 8; j++) {
            a[j] = d[j] ^ d[j + 8];
        }

        arraycopy(d, 8, d, 0, 24);
        arraycopy(a, 0, d, 24, 8);

        return d;
    }

    // (in:) n16||..||n1 ==> (out:) n1^n2^n3^n4^n13^n16||n16||..||n2
    function fw(d) {
        var wS = new Uint16Array(d.buffer, 0, 16);
        var wS15 = wS[0] ^ wS[1] ^ wS[2] ^ wS[3] ^ wS[12] ^ wS[15];
        arraycopy(wS, 1, wS, 0, 15);
        wS[15] = wS15;
    }

    //Encrypt function, ECB mode
    function encrypt(key, s, sOff, d, dOff) {
        var t = new Uint8Array(8);
        arraycopy(d, dOff, t, 0, 8);
        var r = new Uint8Array(this.cipher.encrypt(key, t));
        arraycopy(r, 0, s, sOff, 8);
    }

    // block processing
    function process(d, dOff) {
        var S = new Uint8Array(32),
            U = new Uint8Array(32),
            V = new Uint8Array(32),
            W = new Uint8Array(32);

        arraycopy(d, dOff, M, 0, 32);

        //key step 1

        // H = h3 || h2 || h1 || h0
        // S = s3 || s2 || s1 || s0
        arraycopy(H, 0, U, 0, 32);
        arraycopy(M, 0, V, 0, 32);
        for (var j = 0; j < 32; j++) {
            W[j] = U[j] ^ V[j];
        }
        // Encrypt GOST 28147-ECB
        encrypt.call(this, P(W), S, 0, H, 0); // s0 = EK0 [h0]

        //keys step 2,3,4
        for (var i = 1; i < 4; i++) {
            var tmpA = A(U);
            for (var j = 0; j < 32; j++) {
                U[j] = tmpA[j] ^ C[i][j];
            }
            V = A(A(V));
            for (var j = 0; j < 32; j++) {
                W[j] = U[j] ^ V[j];
            }
            // Encrypt GOST 28147-ECB
            encrypt.call(this, P(W), S, i * 8, H, i * 8); // si = EKi [hi]
        }

        // x(M, H) = y61(H^y(M^y12(S)))
        for (var n = 0; n < 12; n++) {
            fw(S);
        }
        for (var n = 0; n < 32; n++) {
            S[n] = S[n] ^ M[n];
        }

        fw(S);

        for (var n = 0; n < 32; n++) {
            S[n] = H[n] ^ S[n];
        }
        for (var n = 0; n < 61; n++) {
            fw(S);
        }
        arraycopy(S, 0, H, 0, H.length);
    }

    //  256 bitsblock modul -> (Sum + a mod (2^256))
    function summing(d) {
        var carry = 0;
        for (var i = 0; i < Sum.length; i++) {
            var sum = (Sum[i] & 0xff) + (d[i] & 0xff) + carry;

            Sum[i] = sum;

            carry = sum >>> 8;
        }
    }

    // reset the chaining variables to the IV values.
    var C2 = new Uint8Array([
        0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff, 0x00, 0xff, 0x00,
        0xff, 0x00, 0xff, 0x00, 0x00, 0xff, 0xff, 0x00, 0xff, 0x00, 0x00, 0xff,
        0xff, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0xff,
    ]);

    return function (data) {
        // Reset buffers
        H = new Uint8Array(32);
        M = new Uint8Array(32);
        Sum = new Uint8Array(32);

        // Reset IV value
        C = new Array(4);
        for (var i = 0; i < 4; i++) C[i] = new Uint8Array(32);
        arraycopy(C2, 0, C[2], 0, C2.length);

        // Make data
        var d = new Uint8Array(buffer(data));

        var n = d.length;
        var r = n % 32,
            q = (n - r) / 32;

        // Proccess full blocks
        for (var i = 0; i < q; i++) {
            var b = new Uint8Array(d.buffer, i * 32, 32);

            summing.call(this, b); // calc sum M
            process.call(this, b, 0);
        }

        // load d the remadder with padding zero;
        if (r > 0) {
            var b = new Uint8Array(d.buffer, q * 32),
                c = new Uint8Array(32);
            arraycopy(b, 0, c, 0, r);
            summing.call(this, c); // calc sum M
            process.call(this, c, 0);
        }

        // get length into L (byteCount * 8 = bitCount) in little endian.
        var L = new Uint8Array(32),
            n8 = n * 8,
            k = 0;
        while (n8 > 0) {
            L[k++] = n8 & 0xff;
            n8 = Math.floor(n8 / 256);
        }
        process.call(this, L, 0);
        process.call(this, Sum, 0);

        var h = H.buffer;

        // Swap hash for SignalCom
        if (this.procreator === "SC") h = swap(h);

        return h;
    };
})(); // </editor-fold>

/**
 * Algorithm name SHA-1<br><br>
 *
 * https://tools.ietf.org/html/rfc3174
 *
 * The digest method returns digest data in according to SHA-1.<br>
 *
 * @memberOf GostDigest
 * @method digest
 * @instance
 * @param {(ArrayBuffer|TypedArray)} data Data
 * @returns {ArrayBuffer} Digest of data
 */
var digestSHA1 = (function () {
    // <editor-fold defaultstate="collapsed">
    // Create a buffer for each 80 word block.
    var state,
        block = new Uint32Array(80);

    function common(a, e, w, k, f) {
        return (f + e + w + k + ((a << 5) | (a >>> 27))) >>> 0;
    }

    function f1(a, b, c, d, e, w) {
        return common(a, e, w, 0x5a827999, d ^ (b & (c ^ d)));
    }

    function f2(a, b, c, d, e, w) {
        return common(a, e, w, 0x6ed9eba1, b ^ c ^ d);
    }

    function f3(a, b, c, d, e, w) {
        return common(a, e, w, 0x8f1bbcdc, (b & c) | (d & (b | c)));
    }

    function f4(a, b, c, d, e, w) {
        return common(a, e, w, 0xca62c1d6, b ^ c ^ d);
    }

    function cycle(state, block) {
        var a = state[0],
            b = state[1],
            c = state[2],
            d = state[3],
            e = state[4];

        // Partially unroll loops so we don't have to shift variables.
        var fn = f1;
        for (var i = 0; i < 80; i += 5) {
            if (i === 20) {
                fn = f2;
            } else if (i === 40) {
                fn = f3;
            } else if (i === 60) {
                fn = f4;
            }
            e = fn(a, b, c, d, e, block[i]);
            b = ((b << 30) | (b >>> 2)) >>> 0;
            d = fn(e, a, b, c, d, block[i + 1]);
            a = ((a << 30) | (a >>> 2)) >>> 0;
            c = fn(d, e, a, b, c, block[i + 2]);
            e = ((e << 30) | (e >>> 2)) >>> 0;
            b = fn(c, d, e, a, b, block[i + 3]);
            d = ((d << 30) | (d >>> 2)) >>> 0;
            a = fn(b, c, d, e, a, block[i + 4]);
            c = ((c << 30) | (c >>> 2)) >>> 0;
        }
        state[0] += a;
        state[1] += b;
        state[2] += c;
        state[3] += d;
        state[4] += e;
    }

    // Swap bytes for 32bits word
    function swap32(b) {
        return (
            ((b & 0xff) << 24) |
            ((b & 0xff00) << 8) |
            ((b >> 8) & 0xff00) |
            ((b >> 24) & 0xff)
        );
    }

    // input is a Uint8Array bitstream of the data
    return function (data) {
        var d = new Uint8Array(buffer(data)),
            dlen = d.length;

        // Pad the input string length.
        var len = dlen + 9;
        if (len % 64) {
            len += 64 - (len % 64);
        }

        state = new Uint32Array(5);
        state[0] = 0x67452301;
        state[1] = 0xefcdab89;
        state[2] = 0x98badcfe;
        state[3] = 0x10325476;
        state[4] = 0xc3d2e1f0;

        for (var ofs = 0; ofs < len; ofs += 64) {
            // Copy input to block and write padding as needed
            for (var i = 0; i < 64; i++) {
                var b = 0,
                    o = ofs + i;
                if (o < dlen) {
                    b = d[o];
                } else if (o === dlen) {
                    b = 0x80;
                } else {
                    // Write original bit length as a 64bit big-endian integer to the end.
                    var x = len - o - 1;
                    if (x >= 0 && x < 4) {
                        b = ((dlen << 3) >>> (x * 8)) & 0xff;
                    }
                }

                // Interpret the input bytes as big-endian per the spec
                if (i % 4 === 0) {
                    block[i >> 2] = b << 24;
                } else {
                    block[i >> 2] |= b << ((3 - (i % 4)) * 8);
                }
            }

            // Extend the block
            for (var i = 16; i < 80; i++) {
                var w =
                    block[i - 3] ^ block[i - 8] ^ block[i - 14] ^ block[i - 16];
                block[i] = (w << 1) | (w >>> 31);
            }

            cycle(state, block);
        }

        // Swap the bytes around since they are big endian internally
        for (var i = 0; i < 5; i++) state[i] = swap32(state[i]);
        return state.buffer;
    };
})(); // </editor-fold>

/**
 * Algorithm name GOST R 34.11-HMAC<br><br>
 *
 * HMAC with the specified hash function.
 * @memberOf GostDigest
 * @method sign
 * @instance
 * @param {ArrayBuffer} key The key for HMAC.
 * @param {Hash} data Data
 */
function signHMAC(key, data) {
    // <editor-fold defaultstate="collapsed">
    // GOST R 34.11-94 - B=32b, L=32b
    // GOST R 34.11-256 - B=64b, L=32b
    // GOST R 34.11-512 - B=64b, L=64b
    var b = this.digest === digest94 ? 32 : 64,
        l = this.bitLength / 8,
        k = buffer(key),
        d = buffer(data),
        k0;
    if (k.byteLength === b) k0 = new Uint8Array(k);
    else {
        var k0 = new Uint8Array(b);
        if (k.byteLength > b) {
            k0.set(new Uint8Array(this.digest(k)));
        } else {
            k0.set(new Uint8Array(k));
        }
    }
    var s0 = new Uint8Array(b + d.byteLength),
        s1 = new Uint8Array(b + l);
    for (var i = 0; i < b; i++) {
        s0[i] = k0[i] ^ 0x36;
        s1[i] = k0[i] ^ 0x5c;
    }
    s0.set(new Uint8Array(d), b);
    s1.set(new Uint8Array(this.digest(s0)), b);
    return this.digest(s1);
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-HMAC<br><br>
 *
 * Verify HMAC based on GOST R 34.11 hash
 *
 * @memberOf GostDigest
 * @method verify
 * @instance
 * @param {(ArrayBuffer|TypedArray)} key Key which used for HMAC generation
 * @param {(ArrayBuffer|TypedArray)} signature generated HMAC
 * @param {(ArrayBuffer|TypedArray)} data Data
 * @returns {boolean} HMAC verified = true
 */
function verifyHMAC(key, signature, data) {
    // <editor-fold defaultstate="collapsed">
    var hmac = new Uint8Array(this.sign(key, data)),
        test = new Uint8Array(signature);
    if (hmac.length !== test.length) return false;
    for (var i = 0, n = hmac.length; i < n; i++)
        if (hmac[i] !== test[i]) return false;
    return true;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-KDF<br><br>
 *
 * Simple generate key 256/512 bit random seed for derivation algorithms
 *
 * @memberOf GostDigest
 * @method generateKey
 * @instance
 * @returns {ArrayBuffer} Generated key
 */
function generateKey() {
    // <editor-fold defaultstate="collapsed">
    return getSeed(this.bitLength).buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-PFXKDF<br><br>
 *
 * Derive bits from password (PKCS12 mode)
 *  <ul>
 *      <li>algorithm.salt - random value, salt</li>
 *      <li>algorithm.iterations - number of iterations</li>
 *  </ul>
 * @memberOf GostDigest
 * @method deriveBits
 * @instance
 * @param {ArrayBuffer} baseKey - password after UTF-8 decoding
 * @param {number} length output bit-length
 * @returns {ArrayBuffer} result
 */
function deriveBitsPFXKDF(baseKey, length) {
    // <editor-fold defaultstate="collapsed">
    if (length % 8 > 0) throw new DataError("Length must multiple of 8");
    var u = this.bitLength / 8,
        v = this.digest === digest94 ? 32 : 64,
        n = length / 8,
        r = this.iterations;
    //   1.  Construct a string, D (the "diversifier"), by concatenating v/8
    //       copies of ID.
    var ID = this.diversifier,
        D = new Uint8Array(v);
    for (var i = 0; i < v; i++) D[i] = ID;
    //   2.  Concatenate copies of the salt together to create a string S of
    //       length v(ceiling(s/v)) bits (the final copy of the salt may be
    //       truncated to create S).  Note that if the salt is the empty
    //       string, then so is S.
    var S0 = new Uint8Array(buffer(this.salt)),
        s = S0.length,
        slen = v * Math.ceil(s / v),
        S = new Uint8Array(slen);
    for (var i = 0; i < slen; i++) S[i] = S0[i % s];
    //   3.  Concatenate copies of the password together to create a string P
    //       of length v(ceiling(p/v)) bits (the final copy of the password
    //       may be truncated to create P).  Note that if the password is the
    //       empty string, then so is P.
    var P0 = new Uint8Array(buffer(baseKey)),
        p = P0.length,
        plen = v * Math.ceil(p / v),
        P = new Uint8Array(plen);
    for (var i = 0; i < plen; i++) P[i] = P0[i % p];
    //   4.  Set I=S||P to be the concatenation of S and P.
    var I = new Uint8Array(slen + plen);
    arraycopy(S, 0, I, 0, slen);
    arraycopy(P, 0, I, slen, plen);
    //   5.  Set c=ceiling(n/u).
    var c = Math.ceil(n / u);
    //   6.  For i=1, 2, ..., c, do the following:
    var A = new Uint8Array(c * u);
    for (var i = 0; i < c; i++) {
        //  A.  Set A2=H^r(D||I). (i.e., the r-th hash of D||1,
        //      H(H(H(... H(D||I))))
        var H = new Uint8Array(v + slen + plen);
        arraycopy(D, 0, H, 0, v);
        arraycopy(I, 0, H, v, slen + plen);
        for (var j = 0; j < r; j++) H = new Uint8Array(this.digest(H));
        arraycopy(H, 0, A, i * u, u);
        //  B.  Concatenate copies of Ai to create a string B of length v
        //      bits (the final copy of Ai may be truncated to create B).
        var B = new Uint8Array(v);
        for (var j = 0; j < v; j++) B[j] = H[j % u];
        //  C.  Treating I as a concatenation I_0, I_1, ..., I_(k-1) of v-bit
        //      blocks, where k=ceiling(s/v)+ceiling(p/v), modify I by
        //      setting I_j=(I_j+B+1) mod 2^v for each j.
        var k = (slen + plen) / v;
        for (j = 0; j < k; j++) {
            var cf = 1,
                w;
            for (var l = v - 1; l >= 0; --l) {
                w = I[v * j + l] + B[l] + cf;
                cf = w >>> 8;
                I[v * j + l] = w & 0xff;
            }
        }
    }
    //   7.  Concatenate A_1, A_2, ..., A_c together to form a pseudorandom
    //       bit string, A.
    //   8.  Use the first n bits of A as the output of this entire process.
    var R = new Uint8Array(n);
    arraycopy(A, 0, R, 0, n);
    return R.buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-KDF<br><br>
 *
 * Derive bits for KEK deversification in 34.10-2012 algorithm
 * KDF(KEK, UKM, label) = HMAC256 (KEK,  0x01|label|0x00|UKM|0x01|0x00)
 * Default label = 0x26|0xBD|0xB8|0x78
 *
 * @memberOf GostDigest
 * @method deriveBits
 * @instance
 * @param {(ArrayBuffer|TypedArray)} baseKey base key for deriviation
 * @param {number} length output bit-length
 * @returns {ArrayBuffer} result
 */
function deriveBitsKDF(baseKey, length) {
    // <editor-fold defaultstate="collapsed">
    if (length % 8 > 0) throw new DataError("Length must be multiple of 8");
    var rlen = length / 8,
        label,
        context = new Uint8Array(buffer(this.context)),
        blen = this.bitLength / 8,
        n = Math.ceil(rlen / blen);
    if (this.label) label = new Uint8Array(buffer(this.label));
    else label = new Uint8Array([0x26, 0xbd, 0xb8, 0x78]);
    var result = new Uint8Array(rlen);
    for (var i = 0; i < n; i++) {
        var data = new Uint8Array(label.length + context.length + 4);
        data[0] = i + 1;
        data.set(label, 1);
        data[label.length + 1] = 0x00;
        data.set(context, label.length + 2);
        data[data.length - 2] = length >>> 8;
        data[data.length - 1] = length & 0xff;
        result.set(
            new Uint8Array(
                signHMAC.call(this, baseKey, data),
                0,
                i < n - 1 ? blen : rlen - i * blen,
            ),
            i * blen,
        );
    }
    return result.buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-PBKDF1<br><br>
 *
 * Derive bits from password
 *  <ul>
 *      <li>algorithm.salt - random value, salt</li>
 *      <li>algorithm.iterations - number of iterations</li>
 *  </ul>
 * @memberOf GostDigest
 * @method deriveBits
 * @instance
 * @param {ArrayBuffer} baseKey - password after UTF-8 decoding
 * @param {number} length output bit-length
 * @returns {ArrayBuffer} result
 */
function deriveBitsPBKDF1(baseKey, length) {
    // <editor-fold defaultstate="collapsed">
    if (length < this.bitLength / 2 || length % 8 > 0)
        throw new DataError(
            "Length must be more than " +
                this.bitLength / 2 +
                " bits and multiple of 8",
        );
    var hLen = this.bitLength / 8,
        dkLen = length / 8,
        c = this.iterations,
        P = new Uint8Array(buffer(baseKey)),
        S = new Uint8Array(buffer(this.salt)),
        slen = S.length,
        plen = P.length,
        T = new Uint8Array(plen + slen),
        DK = new Uint8Array(dkLen);
    if (dkLen > hLen) throw new DataError("Invalid parameters: Length value");
    arraycopy(P, 0, T, 0, plen);
    arraycopy(S, 0, T, plen, slen);
    for (var i = 0; i < c; i++) T = new Uint8Array(this.digest(T));
    arraycopy(T, 0, DK, 0, dkLen);
    return DK.buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-PBKDF2<br><br>
 *
 * Derive bits from password
 *  <ul>
 *      <li>algorithm.salt - random value, salt</li>
 *      <li>algorithm.iterations - number of iterations</li>
 *  </ul>
 * @memberOf GostDigest
 * @method deriveBits
 * @instance
 * @param {ArrayBuffer} baseKey - password after UTF-8 decoding
 * @param {number} length output bit-length
 * @returns {ArrayBuffer} result
 */
function deriveBitsPBKDF2(baseKey, length) {
    // <editor-fold defaultstate="collapsed">
    var diversifier = this.diversifier || 1; // For PKCS12 MAC required 3*length
    length = length * diversifier;
    if (length < this.bitLength / 2 || length % 8 > 0)
        throw new DataError(
            "Length must be more than " +
                this.bitLength / 2 +
                " bits and multiple of 8",
        );
    var hLen = this.bitLength / 8,
        dkLen = length / 8,
        c = this.iterations,
        P = new Uint8Array(buffer(baseKey)),
        S = new Uint8Array(buffer(this.salt));
    var slen = S.byteLength,
        data = new Uint8Array(slen + 4);
    arraycopy(S, 0, data, 0, slen);

    if (dkLen > (0xffffffff - 1) * 32)
        throw new DataError("Invalid parameters: Length value");
    var n = Math.ceil(dkLen / hLen),
        DK = new Uint8Array(dkLen);
    for (var i = 1; i <= n; i++) {
        data[slen] = (i >>> 24) & 0xff;
        data[slen + 1] = (i >>> 16) & 0xff;
        data[slen + 2] = (i >>> 8) & 0xff;
        data[slen + 3] = i & 0xff;

        var U = new Uint8Array(signHMAC.call(this, P, data)),
            Z = U;
        for (var j = 1; j < c; j++) {
            U = new Uint8Array(signHMAC.call(this, P, U));
            for (var k = 0; k < hLen; k++) Z[k] = U[k] ^ Z[k];
        }
        var ofs = (i - 1) * hLen;
        arraycopy(Z, 0, DK, ofs, Math.min(hLen, dkLen - ofs));
    }
    if (diversifier > 1) {
        var rLen = dkLen / diversifier,
            R = new Uint8Array(rLen);
        arraycopy(DK, dkLen - rLen, R, 0, rLen);
        return R.buffer;
    } else return DK.buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.11-CPKDF<br><br>
 *
 * Derive bits from password. CryptoPro algorithm
 *  <ul>
 *      <li>algorithm.salt - random value, salt</li>
 *      <li>algorithm.iterations - number of iterations</li>
 *  </ul>
 * @memberOf GostDigest
 * @method deriveBits
 * @instance
 * @param {ArrayBuffer} baseKey - password after UTF-8 decoding
 * @param {number} length output bit-length
 * @returns {ArrayBuffer} result
 */
function deriveBitsCP(baseKey, length) {
    if (length > this.bitLength || length % 8 > 0)
        throw new DataError(
            "Length can't be more than " +
                this.bitLength +
                " bits and multiple of 8",
        );
    // GOST R 34.11-94 - B=32b, L=32b
    // GOST R 34.11-256 - B=64b, L=32b
    // GOST R 34.11-512 - B=64b, L=64b
    var b = this.digest === digest94 ? 32 : 64,
        l = this.bitLength / 8,
        p =
            baseKey && baseKey.byteLength > 0
                ? new Uint8Array(buffer(baseKey))
                : false,
        plen = p ? p.length : 0,
        iterations = this.iterations,
        salt = new Uint8Array(buffer(this.salt)),
        slen = salt.length,
        d = new Uint8Array(slen + plen);
    arraycopy(salt, 0, d, 0, slen);
    if (p) arraycopy(p, 0, d, slen, plen);

    var h = new Uint8Array(this.digest(d)),
        k = new Uint8Array(b),
        s0 = new Uint8Array(b),
        s1 = new Uint8Array(b);
    var c = "DENEFH028.760246785.IUEFHWUIO.EF";
    for (var i = 0; i < c.length; i++) k[i] = c.charCodeAt(i);

    d = new Uint8Array(2 * (b + l));
    for (var j = 0; j < iterations; j++) {
        for (var i = 0; i < b; i++) {
            s0[i] = k[i] ^ 0x36;
            s1[i] = k[i] ^ 0x5c;
            k[i] = 0;
        }
        arraycopy(s0, 0, d, 0, b);
        arraycopy(h, 0, d, b, l);
        arraycopy(s1, 0, d, b + l, b);
        arraycopy(h, 0, d, b + l + b, l);
        arraycopy(new Uint8Array(this.digest(d)), 0, k, 0, l);
    }
    for (var i = 0; i < l; i++) {
        s0[i] = k[i] ^ 0x36;
        s1[i] = k[i] ^ 0x5c;
        k[i] = 0;
    }
    d = new Uint8Array(2 * l + slen + plen);
    arraycopy(s0, 0, d, 0, l);
    arraycopy(salt, 0, d, l, slen);
    arraycopy(s1, 0, d, l + slen, l);
    if (p) arraycopy(p, 0, d, l + slen + l, plen);
    h = this.digest(this.digest(d));
    if (length === this.bitLength) return h;
    else {
        var rlen = length / 8,
            r = new Uint8Array(rlen);
        arraycopy(h, 0, r, 0, rlen);
        return r.buffer;
    }
}

/**
 * Algorithm name GOST R 34.11-KDF or GOST R 34.11-PBKDF2 or other<br><br>
 *
 * Derive key from derive bits subset
 *
 * @memberOf GostDigest
 * @method deriveKey
 * @instance
 * @param {ArrayBuffer} baseKey
 * @returns {ArrayBuffer}
 */
function deriveKey(baseKey) {
    // <editor-fold defaultstate="collapsed">
    return this.deriveBits(baseKey, this.keySize * 8);
} // </editor-fold>

/**
 * GOST R 34.11 Algorithm<br><br>
 *
 * References: {@link http://tools.ietf.org/html/rfc6986} and {@link http://tools.ietf.org/html/rfc5831}<br><br>
 *
 * Normalized algorithm identifier common parameters:
 *
 *  <ul>
 *      <li><b>name</b> Algorithm name 'GOST R 34.11'</li>
 *      <li><b>version</b> Algorithm version
 *          <ul>
 *              <li><b>1994</b> old-style 256 bits digest based on GOST 28147-89</li>
 *              <li><b>2012</b> 256 ro 512 bits digest algorithm "Streebog" GOST R 34.11-2012 (default)</li>
 *          </ul>
 *      </li>
 *      <li><b>length</b> Digest length
 *          <ul>
 *              <li><b>256</b> 256 bits digest</li>
 *              <li><b>512</b> 512 bits digest, valid only for algorithm "Streebog"</li>
 *          </ul>
 *      </li>
 *      <li><b>mode</b> Algorithm mode
 *          <ul>
 *              <li><b>HASH</b> simple digest mode (default)</li>
 *              <li><b>HMAC</b> HMAC algorithm based on GOST R 34.11</li>
 *              <li><b>KDF</b> Derive bits for KEK deversification</li>
 *              <li><b>PBKDF2</b> Password based key dirivation algorithms PBKDF2 (based on HMAC)</li>
 *              <li><b>PFXKDF</b> Password based PFX key dirivation algorithms</li>
 *              <li><b>CPKDF</b> CpyptoPro Password based key dirivation algorithms</li>
 *          </ul>
 *      </li>
 *      <li><b>sBox</b> Paramset sBox for GOST 28147-89. Used only if version = 1994</li>
 *  </ul>
 *
 * Supported algorithms, modes and parameters:
 *
 *  <ul>
 *      <li>Digest HASH mode (default)</li>
 *      <li>Sign/Verify HMAC modes parameters depends on version and length
 *          <ul>
 *              <li><b>version: 1994</b> HMAC parameters (B = 32, L = 32)</li>
 *              <li><b>version: 2012, length: 256</b> HMAC parameters (B = 64, L = 32)</li>
 *              <li><b>version: 2012, length: 512</b> HMAC parameters  (B = 64, L = 64)</li>
 *          </ul>
 *      </li>
 *      <li>DeriveBits/DeriveKey KDF mode
 *          <ul>
 *              <li><b>context</b> {@link CryptoOperationData} Context of the key derivation</li>
 *              <li><b>label</b> {@link CryptoOperationData} Label that identifies the purpose for the derived keying material</li>
 *          </ul>
 *      </li>
 *      <li>DeriveBits/DeriveKey PBKDF2 mode
 *          <ul>
 *              <li><b>salt</b> {@link CryptoOperationData} Random salt as input for HMAC algorithm</li>
 *              <li><b>iterations</b> Iteration count. GOST recomended value 1000 (default) or 2000</li>
 *              <li><b>diversifier</b> Deversifier, ID=1 - key material for performing encryption or decryption, ID=3 - integrity key for MACing</li>
 *          </ul>
 *      </li>
 *      <li>DeriveBits/DeriveKey PFXKDF mode
 *          <ul>
 *              <li><b>salt</b> {@link CryptoOperationData} Random salt as input for HMAC algorithm</li>
 *              <li><b>iterations</b> Iteration count. GOST recomended value 1000 (default) or 2000</li>
 *              <li><b>diversifier</b> Deversifier, ID=1 - key material for performing encryption or decryption,
 *              ID=2 - IV (Initial Value) for encryption or decryption, ID=3 - integrity key for MACing</li>
 *          </ul>
 *      </li>
 *      <li>DeriveBits/DeriveKey CPKDF mode
 *          <ul>
 *              <li><b>salt</b> {@link CryptoOperationData} Random salt as input for HMAC algorithm</li>
 *              <li><b>iterations</b> Iteration count. GOST recomended value 1000 (default) or 2000</li>
 *          </ul>
 *      </li>
 *  </ul>
 *
 * @class GostDigest
 * @param {AlgorithmIdentifier} algorithm WebCryptoAPI algorithm identifier
 */
function GostDigest(algorithm) {
    // <editor-fold defaultstate="collapsed">
    algorithm = algorithm || {};

    this.name =
        (algorithm.name || "GOST R 34.10") +
        "-" +
        ((algorithm.version || 2012) % 100) +
        ((algorithm.version || 2012) > 1
            ? "-" + (algorithm.length || 256)
            : "") +
        ((algorithm.mode || "HASH") !== "HASH" ? "-" + algorithm.mode : "") +
        (algorithm.procreator ? "/" + algorithm.procreator : "") +
        (typeof algorithm.sBox === "string" ? "/" + algorithm.sBox : "");

    // Algorithm procreator
    this.procreator = algorithm.procreator;

    // Bit length
    this.bitLength = algorithm.length || 256;

    switch (algorithm.version || 2012) {
        case 1: // SHA-1
            this.digest = digestSHA1;
            this.bitLength = 160;
            break;
        case 1994:
            this.digest = digest94;
            // Define chiper algorithm
            this.sBox = (
                algorithm.sBox ||
                (algorithm.procreator === "SC" ? "D-SC" : "D-A")
            ).toUpperCase();

            //if (!GostCipher)
            //    GostCipher = root.GostCipher;
            if (!GostCipher)
                throw new NotSupportedError("Object GostCipher not found");

            this.cipher = new GostCipher({
                name: "GOST 28147",
                block: "ECB",
                sBox: this.sBox,
                procreator: this.procreator,
            });

            break;
        case 2012:
            this.digest = digest2012;
            break;
        default:
            throw new NotSupportedError(
                "Algorithm version " + algorithm.version + " not supported",
            );
    }

    // Key size
    this.keySize =
        algorithm.keySize || (algorithm.version <= 2 ? this.bitLength / 8 : 32);

    switch (algorithm.mode || "HASH") {
        case "HASH":
            break;
        case "HMAC":
            this.sign = signHMAC;
            this.verify = verifyHMAC;
            this.generateKey = generateKey;
            break;
        case "KDF":
            this.deriveKey = deriveKey;
            this.deriveBits = deriveBitsKDF;
            this.label = algorithm.label;
            this.context = algorithm.context;
            break;
        case "PBKDF2":
            this.deriveKey = deriveKey;
            this.deriveBits = deriveBitsPBKDF2;
            this.generateKey = generateKey;
            this.salt = algorithm.salt;
            this.iterations = algorithm.iterations || 2000;
            this.diversifier = algorithm.diversifier || 1;
            break;
        case "PFXKDF":
            this.deriveKey = deriveKey;
            this.deriveBits = deriveBitsPFXKDF;
            this.generateKey = generateKey;
            this.salt = algorithm.salt;
            this.iterations = algorithm.iterations || 2000;
            this.diversifier = algorithm.diversifier || 1;
            break;
        case "CPKDF":
            this.deriveKey = deriveKey;
            this.deriveBits = deriveBitsCP;
            this.generateKey = generateKey;
            this.salt = algorithm.salt;
            this.iterations = algorithm.iterations || 2000;
            break;
        default:
            throw new NotSupportedError(
                "Algorithm mode " + algorithm.mode + " not supported",
            );
    }
} // </editor-fold>

export default GostDigest;
