/**
 * Implementation Web Crypto random generatore for GOST algorithms
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
import crypto from "crypto";

/**
 * The gostCrypto provide general purpose cryptographic functionality for
 * GOST standards including a cryptographically strong pseudo-random number
 * generator seeded with truly random values.
 *
 * @Class GostRandom
 *
 */ // <editor-fold defaultstate="collapsed">

var root = {};
var rootCrypto = crypto;

var TypeMismatchError = Error;
var QuotaExceededError = Error;

// Initialize mouse and time counters for random generator
var randomRing = {
    seed: new Uint8Array(1024),
    getIndex: 0,
    setIndex: 0,
    set: function (x) {
        if (this.setIndex >= 1024) this.setIndex = 0;
        this.seed[this.setIndex++] = x;
    },
    get: function () {
        if (this.getIndex >= 1024) this.getIndex = 0;
        return this.seed[this.getIndex++];
    }
};

if (typeof document !== "undefined") {
    try {
        // Mouse move event to fill random array
        document.addEventListener(
            "mousemove",
            function (e) {
                randomRing.set((Date.now() & 255) ^ ((e.clientX || e.pageX) & 255) ^ ((e.clientY || e.pageY) & 255));
            },
            false
        );
    } catch (e) {}

    try {
        // Keypress event to fill random array
        document.addEventListener(
            "keydown",
            function (e) {
                randomRing.set((Date.now() & 255) ^ (e.keyCode & 255));
            },
            false
        );
    } catch (e) {}
} // </editor-fold>

function GostRandom() {}

/**
 * The getRandomValues method generates cryptographically random values. <br><br>
 *
 * Random generator based on JavaScript Web Crypto random genereator
 * (if it is possible) or  Math.random mixed with time and parameters of
 * mouse and keyboard events
 *
 * @memberOf GostRandom
 * @param {(ArrayBuffer|ArrayBufferView)} array Destination buffer for random data
 */
GostRandom.prototype.getRandomValues = function (array) {
    // <editor-fold defaultstate="collapsed">
    if (!array.byteLength)
        throw new TypeMismatchError(
            "Array is not of an integer type (Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, or Uint32Array)"
        );

    if (array.byteLength > 65536) throw new QuotaExceededError("Byte length of array can't be greate then 65536");

    var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    if (rootCrypto && rootCrypto.getRandomValues) {
        // Native window cryptographic interface
        rootCrypto.getRandomValues(u8);
    } else {
        // Standard Javascript method
        for (var i = 0, n = u8.length; i < n; i++) u8[i] = Math.floor(256 * Math.random()) & 255;
    }

    // Mix bio randomizator
    for (var i = 0, n = u8.length; i < n; i++) u8[i] = u8[i] ^ randomRing.get();
    return array;
}; // </editor-fold>

export default GostRandom;
