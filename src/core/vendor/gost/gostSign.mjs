/**
 * @file GOST 34.10-2012 signature function with 1024/512 bits digest
 * @version 1.76
 * @copyright 2014-2016, Rudolf Nickolaev. All rights reserved.
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
 * Used library JSBN http://www-cs-students.stanford.edu/~tjw/jsbn/
 * Copyright (c) 2003-2005  Tom Wu (tjw@cs.Stanford.EDU)
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

 import GostRandom from './gostRandom.mjs';
 import GostDigest from './gostDigest.mjs';

 import crypto from 'crypto';

    /*
     * Predefined curves and params collection
     *
     * http://tools.ietf.org/html/rfc5832
     * http://tools.ietf.org/html/rfc7091
     * http://tools.ietf.org/html/rfc4357
     *
     */ // <editor-fold defaultstate="collapsed">

var root = {};
var rootCrypto = crypto;
var CryptoOperationData = ArrayBuffer;

var OperationError = Error,
        DataError = Error,
        NotSupportedError = Error;

// Predefined named curve collection
var ECGostParams = {
    'S-256-TEST': {
        a: 7,
        b: '0x5FBFF498AA938CE739B8E022FBAFEF40563F6E6A3472FC2A514C0CE9DAE23B7E',
        p: '0x8000000000000000000000000000000000000000000000000000000000000431',
        q: '0x8000000000000000000000000000000150FE8A1892976154C59CFC193ACCF5B3',
        x: 2,
        y: '0x8E2A8A0E65147D4BD6316030E16D19C85C97F0A9CA267122B96ABBCEA7E8FC8'
    },
    'S-256-A': {
        a: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD94',
        b: 166,
        p: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD97',
        q: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF6C611070995AD10045841B09B761B893',
        x: 1,
        y: '0x8D91E471E0989CDA27DF505A453F2B7635294F2DDF23E3B122ACC99C9E9F1E14'
    },
    'S-256-B': {
        a: '0x8000000000000000000000000000000000000000000000000000000000000C96',
        b: '0x3E1AF419A269A5F866A7D3C25C3DF80AE979259373FF2B182F49D4CE7E1BBC8B',
        p: '0x8000000000000000000000000000000000000000000000000000000000000C99',
        q: '0x800000000000000000000000000000015F700CFFF1A624E5E497161BCC8A198F',
        x: 1,
        y: '0x3FA8124359F96680B83D1C3EB2C070E5C545C9858D03ECFB744BF8D717717EFC'
    },
    'S-256-C': {
        a: '0x9B9F605F5A858107AB1EC85E6B41C8AACF846E86789051D37998F7B9022D7598',
        b: 32858,
        p: '0x9B9F605F5A858107AB1EC85E6B41C8AACF846E86789051D37998F7B9022D759B',
        q: '0x9B9F605F5A858107AB1EC85E6B41C8AA582CA3511EDDFB74F02F3A6598980BB9',
        x: 0,
        y: '0x41ECE55743711A8C3CBF3783CD08C0EE4D4DC440D4641A8F366E550DFDB3BB67'
    },
    'P-256': {
        p: '0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF',
        a: '0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC',
        b: '0x5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B',
        x: '0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296',
        y: '0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5',
        q: '0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551'
    },
    'T-512-TEST': {
        a: 7,
        b: '0x1CFF0806A31116DA29D8CFA54E57EB748BC5F377E49400FDD788B649ECA1AC4361834013B2AD7322480A89CA58E0CF74BC9E540C2ADD6897FAD0A3084F302ADC',
        p: '0x4531ACD1FE0023C7550D267B6B2FEE80922B14B2FFB90F04D4EB7C09B5D2D15DF1D852741AF4704A0458047E80E4546D35B8336FAC224DD81664BBF528BE6373',
        q: '0x4531ACD1FE0023C7550D267B6B2FEE80922B14B2FFB90F04D4EB7C09B5D2D15DA82F2D7ECB1DBAC719905C5EECC423F1D86E25EDBE23C595D644AAF187E6E6DF',
        x: '0x24D19CC64572EE30F396BF6EBBFD7A6C5213B3B3D7057CC825F91093A68CD762FD60611262CD838DC6B60AA7EEE804E28BC849977FAC33B4B530F1B120248A9A',
        y: '0x2BB312A43BD2CE6E0D020613C857ACDDCFBF061E91E5F2C3F32447C259F39B2C83AB156D77F1496BF7EB3351E1EE4E43DC1A18B91B24640B6DBB92CB1ADD371E'
    },
    'T-512-A': {
        p: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDC7',
        a: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDC4',
        b: '0xE8C2505DEDFC86DDC1BD0B2B6667F1DA34B82574761CB0E879BD081CFD0B6265EE3CB090F30D27614CB4574010DA90DD862EF9D4EBEE4761503190785A71C760',
        q: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF27E69532F48D89116FF22B8D4E0560609B4B38ABFAD2B85DCACDB1411F10B275',
        x: 3,
        y: '0x7503CFE87A836AE3A61B8816E25450E6CE5E1C93ACF1ABC1778064FDCBEFA921DF1626BE4FD036E93D75E6A50E3A41E98028FE5FC235F5B889A589CB5215F2A4'
    },
    'T-512-B': {
        p: '0x8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006F',
        a: '0x8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006C',
        b: '0x687D1B459DC841457E3E06CF6F5E2517B97C7D614AF138BCBF85DC806C4B289F3E965D2DB1416D217F8B276FAD1AB69C50F78BEE1FA3106EFB8CCBC7C5140116',
        q: '0x800000000000000000000000000000000000000000000000000000000000000149A1EC142565A545ACFDB77BD9D40CFA8B996712101BEA0EC6346C54374F25BD',
        x: 2,
        y: '0x1A8F7EDA389B094C2C071E3647A8940F3C123B697578C213BE6DD9E6C8EC7335DCB228FD1EDF4A39152CBCAAF8C0398828041055F94CEEEC7E21340780FE41BD'
    }
};
ECGostParams['X-256-A'] = ECGostParams['S-256-A'];
ECGostParams['X-256-B'] = ECGostParams['S-256-C'];
ECGostParams['T-256-TEST'] = ECGostParams['S-256-TEST'];
ECGostParams['T-256-A'] = ECGostParams['S-256-A'];
ECGostParams['T-256-B'] = ECGostParams['S-256-B'];
ECGostParams['T-256-C'] = ECGostParams['S-256-C'];


var GostParams = {
    'S-TEST': {
        modulusLength: 512, // bit length of p (512 or 1024 bits)
        p: '0xEE8172AE8996608FB69359B89EB82A69854510E2977A4D63BC97322CE5DC3386EA0A12B343E9190F23177539845839786BB0C345D165976EF2195EC9B1C379E3',
        q: '0x98915E7EC8265EDFCDA31E88F24809DDB064BDC7285DD50D7289F0AC6F49DD2D',
        a: '0x9e96031500c8774a869582d4afde2127afad2538b4b6270a6f7c8837b50d50f206755984a49e509304d648be2ab5aab18ebe2cd46ac3d8495b142aa6ce23e21c'
    },
    'S-A': {
        modulusLength: 1024,
        p: '0xB4E25EFB018E3C8B87505E2A67553C5EDC56C2914B7E4F89D23F03F03377E70A2903489DD60E78418D3D851EDB5317C4871E40B04228C3B7902963C4B7D85D52B9AA88F2AFDBEB28DA8869D6DF846A1D98924E925561BD69300B9DDD05D247B5922D967CBB02671881C57D10E5EF72D3E6DAD4223DC82AA1F7D0294651A480DF',
        q: '0x972432A437178B30BD96195B773789AB2FFF15594B176DD175B63256EE5AF2CF',
        a: '0x8FD36731237654BBE41F5F1F8453E71CA414FFC22C25D915309E5D2E62A2A26C7111F3FC79568DAFA028042FE1A52A0489805C0DE9A1A469C844C7CABBEE625C3078888C1D85EEA883F1AD5BC4E6776E8E1A0750912DF64F79956499F1E182475B0B60E2632ADCD8CF94E9C54FD1F3B109D81F00BF2AB8CB862ADF7D40B9369A'
    },
    'S-B': {
        modulusLength: 1024,
        p: '0xC6971FC57524B30C9018C5E621DE15499736854F56A6F8AEE65A7A404632B1BCF0349FFCAFCB0A103177971FC1612ADCDB8C8CC938C70225C8FD12AFF01B1D064E0AD6FDE6AB9159166CB9F2FC171D92F0CC7B6A6B2CD7FA342ACBE2C9315A42D576B1ECCE77A963157F3D0BD96A8EB0B0F3502AD238101B05116334F1E5B7AB',
        q: '0xB09D634C10899CD7D4C3A7657403E05810B07C61A688BAB2C37F475E308B0607',
        a: '0x3D26B467D94A3FFC9D71BF8DB8934084137264F3C2E9EB16DCA214B8BC7C872485336744934FD2EF5943F9ED0B745B90AA3EC8D70CDC91682478B664A2E1F8FB56CEF2972FEE7EDB084AF746419B854FAD02CC3E3646FF2E1A18DD4BEB3C44F7F2745588029649674546CC9187C207FB8F2CECE8E2293F68395C4704AF04BAB5'
    },
    'S-C': {
        modulusLength: 1024,
        p: '0x9D88E6D7FE3313BD2E745C7CDD2AB9EE4AF3C8899E847DE74A33783EA68BC30588BA1F738C6AAF8AB350531F1854C3837CC3C860FFD7E2E106C3F63B3D8A4C034CE73942A6C3D585B599CF695ED7A3C4A93B2B947B7157BB1A1C043AB41EC8566C6145E938A611906DE0D32E562494569D7E999A0DDA5C879BDD91FE124DF1E9',
        q: '0xFADD197ABD19A1B4653EECF7ECA4D6A22B1F7F893B641F901641FBB555354FAF',
        a: '0x7447ED7156310599070B12609947A5C8C8A8625CF1CF252B407B331F93D639DDD1BA392656DECA992DD035354329A1E95A6E32D6F47882D960B8F10ACAFF796D13CD9611F853DAB6D2623483E46788708493937A1A29442598AEC2E0742022563440FE9C18740ECE6765AC05FAF024A64B026E7E408840819E962E7E5F401AE3'
    },
    'S-D': {
        modulusLength: 1024,
        p: '0x80F102D32B0FD167D069C27A307ADAD2C466091904DBAA55D5B8CC7026F2F7A1919B890CB652C40E054E1E9306735B43D7B279EDDF9102001CD9E1A831FE8A163EED89AB07CF2ABE8242AC9DEDDDBF98D62CDDD1EA4F5F15D3A42A6677BDD293B24260C0F27C0F1D15948614D567B66FA902BAA11A69AE3BCEADBB83E399C9B5',
        q: '0xF0F544C418AAC234F683F033511B65C21651A6078BDA2D69BB9F732867502149',
        a: '0x6BCC0B4FADB3889C1E06ADD23CC09B8AB6ECDEDF73F04632595EE4250005D6AF5F5ADE44CB1E26E6263C672347CFA26F9E9393681E6B759733784CDE5DBD9A14A39369DFD99FA85CC0D10241C4010343F34A91393A706CF12677CBFA1F578D6B6CFBE8A1242CFCC94B3B653A476E145E3862C18CC3FED8257CFEF74CDB205BF1'
    },
    'X-A': {
        modulusLength: 1024,
        p: '0xCA3B3F2EEE9FD46317D49595A9E7518E6C63D8F4EB4D22D10D28AF0B8839F079F8289E603B03530784B9BB5A1E76859E4850C670C7B71C0DF84CA3E0D6C177FE9F78A9D8433230A883CD82A2B2B5C7A3306980278570CDB79BF01074A69C9623348824B0C53791D53C6A78CAB69E1CFB28368611A397F50F541E16DB348DBE5F',
        q: '0xCAE4D85F80C147704B0CA48E85FB00A9057AA4ACC44668E17F1996D7152690D9',
        a: '0xBE27D652F2F1E339DA734211B85B06AE4DE236AA8FBEEB3F1ADCC52CD43853777E834A6A518138678A8ADBD3A55C70A7EAB1BA7A0719548677AAF4E609FFB47F6B9D7E45B0D06D83D7ADC53310ABD85783E7317F7EC73268B6A9C08D260B85D8485696CA39C17B17F044D1E050489036ABD381C5E6BF82BA352A1AFF136601AF'
    },
    'X-B': {
        modulusLength: 1024,
        p: '0x9286DBDA91ECCFC3060AA5598318E2A639F5BA90A4CA656157B2673FB191CD0589EE05F4CEF1BD13508408271458C30851CE7A4EF534742BFB11F4743C8F787B11193BA304C0E6BCA25701BF88AF1CB9B8FD4711D89F88E32B37D95316541BF1E5DBB4989B3DF13659B88C0F97A3C1087B9F2D5317D557DCD4AFC6D0A754E279',
        q: '0xC966E9B3B8B7CDD82FF0F83AF87036C38F42238EC50A876CD390E43D67B6013F',
        a: '0x7E9C3096676F51E3B2F9884CF0AC2156779496F410E049CED7E53D8B7B5B366B1A6008E5196605A55E89C3190DABF80B9F1163C979FCD18328DAE5E9048811B370107BB7715F82091BB9DE0E33EE2FED6255474F8769FCE5EAFAEEF1CB5A32E0D5C6C2F0FC0B3447072947F5B4C387666993A333FC06568E534AD56D2338D729'
    },
    'X-C': {
        modulusLength: 1024,
        p: '0xB194036ACE14139D36D64295AE6C50FC4B7D65D8B340711366CA93F383653908EE637BE428051D86612670AD7B402C09B820FA77D9DA29C8111A8496DA6C261A53ED252E4D8A69A20376E6ADDB3BDCD331749A491A184B8FDA6D84C31CF05F9119B5ED35246EA4562D85928BA1136A8D0E5A7E5C764BA8902029A1336C631A1D',
        q: '0x96120477DF0F3896628E6F4A88D83C93204C210FF262BCCB7DAE450355125259',
        a: '0x3F1817052BAA7598FE3E4F4FC5C5F616E122CFF9EBD89EF81DC7CE8BF56CC64B43586C80F1C4F56DD5718FDD76300BE336784259CA25AADE5A483F64C02A20CF4A10F9C189C433DEFE31D263E6C9764660A731ECCAECB74C8279303731E8CF69205BC73E5A70BDF93E5BB681DAB4EEB9C733CAAB2F673C475E0ECA921D29782E'
    }
}; // </editor-fold>

/*
    * BigInteger arithmetic tools
    * optimized release of http://www-cs-students.stanford.edu/~tjw/jsbn/jsbn.js
    *
    */ // <editor-fold defaultstate="collapsed">

// Bits per one element
var DB = 28, DM = (1 << DB) - 1, DV = 1 << DB,
        FV = Math.pow(2, 52), F1 = 52 - DB, F2 = 2 * DB - 52;

function am(y, i, x, w, j, c, n) {
    var xl = x & 0x3fff, xh = x >> 14;
    while (--n >= 0) {
        var l = y[i] & 0x3fff;
        var h = y[i++] >> 14;
        var m = xh * l + h * xl;
        l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
        c = (l >> 28) + (m >> 14) + xh * h;
        w[j++] = l & 0xfffffff;
    }
    return c;
}

function nbi(words) {
    var r = new Array(Math.ceil(words));
    r.s = 0;
    r.t = 0;
    return r;
}

function copyTo(x, r) {
    for (var i = x.t - 1; i >= 0; --i)
        r[i] = x[i];
    r.t = x.t;
    r.s = x.s;
    return r;
}

function copy(x) {
    return copyTo(x, nbi(x.t));
}

function setInt(x, i) {
    x.t = 1;
    x.s = (i < 0) ? -1 : 0;
    if (i > 0)
        x[0] = i;
    else if (i < -1)
        x[0] = i + DV;
    else
        x.t = 0;
    return x;
}

function nbv(i) {
    var r = nbi(1);
    setInt(r, i);
    return r;
}

var ZERO = nbv(0), ONE = nbv(1), THREE = nbv(3);

function clamp(x) {
    var c = x.s & DM;
    while (x.t > 0 && x[x.t - 1] === c)
        --x.t;
    return x;
}

function subTo(x, a, r) {
    var i = 0, c = 0, m = Math.min(a.t, x.t);
    while (i < m) {
        c += x[i] - a[i];
        r[i++] = c & DM;
        c >>= DB;
    }
    if (a.t < x.t) {
        c -= a.s;
        while (i < x.t) {
            c += x[i];
            r[i++] = c & DM;
            c >>= DB;
        }
        c += x.s;
    }
    else {
        c += x.s;
        while (i < a.t) {
            c -= a[i];
            r[i++] = c & DM;
            c >>= DB;
        }
        c -= a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c < -1)
        r[i++] = DV + c;
    else if (c > 0)
        r[i++] = c;
    r.t = i;
    return clamp(r);
}

function sub(x, y) {
    return subTo(x, y, nbi(x.t));
}

function addTo(x, a, r) {
    var i = 0, c = 0, m = Math.min(a.t, x.t);
    while (i < m) {
        c += x[i] + a[i];
        r[i++] = c & DM;
        c >>= DB;
    }
    if (a.t < x.t) {
        c += a.s;
        while (i < x.t) {
            c += x[i];
            r[i++] = c & DM;
            c >>= DB;
        }
        c += x.s;
    }
    else {
        c += x.s;
        while (i < a.t) {
            c += a[i];
            r[i++] = c & DM;
            c = c >> DB;
        }
        c += a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c > 0)
        r[i++] = c;
    else if (c < -1)
        r[i++] = DV + c;
    r.t = i;
    return clamp(r);
}

function add(x, y) {
    return addTo(x, y, nbi(x.t));
}

function negTo(x, r) {
    return subTo(ZERO, x, r);
}

function neg(x) {
    return negTo(x, nbi(x.t));
}

function absTo(x, r) {
    return (x.s < 0) ? negTo(r) : copyTo(r);
}

function abs(x) {
    return (x.s < 0) ? neg(x) : x;
}

function compare(x, a) {
    var r = x.s - a.s;
    if (r !== 0)
        return r;
    var i = x.t;
    r = i - a.t;
    if (r !== 0)
        return (x.s < 0) ? -r : r;
    while (--i >= 0)
        if ((r = x[i] - a[i]) !== 0)
            return r;
    return 0;
}

function equals(x, y) {
    return(compare(x, y) === 0);
}

function min(x, y) {
    return(compare(x, y) < 0) ? x : y;
}

function max(x, y) {
    return(compare(x, y) > 0) ? x : y;
}

function nbits(x) {
    var r = 1, t;
    if ((t = x >>> 16) !== 0) {
        x = t;
        r += 16;
    }
    if ((t = x >> 8) !== 0) {
        x = t;
        r += 8;
    }
    if ((t = x >> 4) !== 0) {
        x = t;
        r += 4;
    }
    if ((t = x >> 2) !== 0) {
        x = t;
        r += 2;
    }
    if ((t = x >> 1) !== 0) {
        x = t;
        r += 1;
    }
    return r;
}

function dshlTo(x, n, r) {
    var i;
    for (i = x.t - 1; i >= 0; --i)
        r[i + n] = x[i];
    for (i = n - 1; i >= 0; --i)
        r[i] = 0;
    r.t = x.t + n;
    r.s = x.s;
    return r;
}
function dshrTo(x, n, r) {
    for (var i = n; i < x.t; ++i)
        r[i - n] = x[i];
    r.t = Math.max(x.t - n, 0);
    r.s = x.s;
    return r;
}

function shlTo(x, n, r) {
    var bs = n % DB;
    var cbs = DB - bs;
    var bm = (1 << cbs) - 1;
    var ds = Math.floor(n / DB), c = (x.s << bs) & DM, i;
    for (i = x.t - 1; i >= 0; --i) {
        r[i + ds + 1] = (x[i] >> cbs) | c;
        c = (x[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i)
        r[i] = 0;
    r[ds] = c;
    r.t = x.t + ds + 1;
    r.s = x.s;
    return clamp(r);
}

function shrTo(x, n, r) {
    r.s = x.s;
    var ds = Math.floor(n / DB);
    if (ds >= x.t) {
        r.t = 0;
        return;
    }
    var bs = n % DB;
    var cbs = DB - bs;
    var bm = (1 << bs) - 1;
    r[0] = x[ds] >> bs;
    for (var i = ds + 1; i < x.t; ++i) {
        r[i - ds - 1] |= (x[i] & bm) << cbs;
        r[i - ds] = x[i] >> bs;
    }
    if (bs > 0)
        r[x.t - ds - 1] |= (x.s & bm) << cbs;
    r.t = x.t - ds;
    return clamp(r);
}

function shl(x, n) {
    var r = nbi(x.t);
    if (n < 0)
        shrTo(x, -n, r);
    else
        shlTo(x, n, r);
    return r;
}

function shr(x, n) {
    var r = nbi(x.t);
    if (n < 0)
        shlTo(x, -n, r);
    else
        shrTo(x, n, r);
    return r;
}

function bitLength(x) {
    if (x.t <= 0)
        return 0;
    return DB * (x.t - 1) + nbits(x[x.t - 1] ^ (x.s & DM));
}

function mulTo(b, a, r) {
    var x = abs(b), y = abs(a);
    var i = x.t;
    r.t = i + y.t;
    while (--i >= 0)
        r[i] = 0;
    for (i = 0; i < y.t; ++i)
        r[i + x.t] = am(x, 0, y[i], r, i, 0, x.t);
    r.s = 0;
    if (b.s !== a.s)
        subTo(ZERO, r, r);
    return clamp(r);
}

function mul(x, y) {
    return mulTo(x, y, nbi(x.t + y.t));
}

function sqrTo(a, r) {
    var x = abs(a);
    var i = r.t = 2 * x.t;
    while (--i >= 0)
        r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
        var c = am(x, i, x[i], r, 2 * i, 0, 1);
        if ((r[i + x.t] += am(x, i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
            r[i + x.t] -= x.DV;
            r[i + x.t + 1] = 1;
        }
    }
    if (r.t > 0)
        r[r.t - 1] += am(x, i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    return clamp(r);
}

function sqr(a) {
    return sqrTo(a, nbi(a.t * 2));
}

function divRemTo(n, m, q, r) {
    var pm = abs(m);
    if (pm.t <= 0)
        throw new OperationError('Division by zero');
    var pt = abs(n);
    if (pt.t < pm.t) {
        if (q)
            setInt(q, 0);
        if (r)
            copyTo(n, r);
        return q;
    }
    if (!r)
        r = nbi(m.t);
    var y = nbi(m.t), ts = n.s, ms = m.s;
    var nsh = DB - nbits(pm[pm.t - 1]);
    if (nsh > 0) {
        shlTo(pm, nsh, y);
        shlTo(pt, nsh, r);
    }
    else {
        copyTo(pm, y);
        copyTo(pt, r);
    }
    var ys = y.t;
    var y0 = y[ys - 1];
    if (y0 === 0)
        return q;
    var yt = y0 * (1 << F1) + ((ys > 1) ? y[ys - 2] >> F2 : 0);
    var d1 = FV / yt, d2 = (1 << F1) / yt, e = 1 << F2;
    var i = r.t, j = i - ys, t = !q ? nbi(Math.max(n.t - m.t, 1)) : q;
    dshlTo(y, j, t);
    if (compare(r, t) >= 0) {
        r[r.t++] = 1;
        subTo(r, t, r);
    }
    dshlTo(ONE, ys, t);
    subTo(t, y, y);
    while (y.t < ys)
        y[y.t++] = 0;
    while (--j >= 0) {
        var qd = (r[--i] === y0) ? DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
        if ((r[i] += am(y, 0, qd, r, j, 0, ys)) < qd) {
            dshlTo(y, j, t);
            subTo(r, t, r);
            while (r[i] < --qd)
                subTo(r, t, r);
        }
    }
    if (q) {
        dshrTo(r, ys, q);
        if (ts !== ms)
            subTo(ZERO, q, q);
    }
    r.t = ys;
    clamp(r);
    if (nsh > 0)
        shrTo(r, nsh, r);
    if (ts < 0)
        subTo(ZERO, r, r);
    return q;
}

function modTo(b, a, r) {
    divRemTo(abs(b), a, null, r);
    if (b.s < 0 && compare(r, ZERO) > 0)
        subTo(a, r, r);
    return r;
}

function mod(b, a) {
    return modTo(b, a, nbi(a.t));
}

function div(b, a) {
    return divRemTo(b, a, nbi(Math.max(b.t - a.t, 1)), null);
}

function isEven(x) {

    return ((x.t > 0) ? (x[0] & 1) : x.s) === 0;
}

function isZero(x) {
    return equals(x, ZERO);
}

function sig(x) {
    if (x.s < 0)
        return -1;
    else if (x.t <= 0 || (x.t === 1 && x[0] <= 0))
        return 0;
    else
        return 1;
}

function invMod(x, m) {
    var ac = isEven(m);
    if ((isEven(x) && ac) || sig(m) === 0)
        return ZERO;
    var u = copy(m), v = copy(x);
    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
    while (sig(u) !== 0) {
        while (isEven(u)) {
            shrTo(u, 1, u);
            if (ac) {
                if (!isEven(a) || !isEven(b)) {
                    addTo(a, x, a);
                    subTo(b, m, b);
                }
                shrTo(a, 1, a);
            }
            else if (!isEven(b))
                subTo(b, m, b);
            shrTo(b, 1, b);
        }
        while (isEven(v)) {
            shrTo(v, 1, v);
            if (ac) {
                if (!isEven(c) || !isEven(d)) {
                    addTo(c, x, c);
                    subTo(d, m, d);
                }
                shrTo(c, 1, c);
            }
            else if (!isEven(d))
                subTo(d, m, d);
            shrTo(d, 1, d);
        }
        if (compare(u, v) >= 0) {
            subTo(u, v, u);
            if (ac)
                subTo(a, c, a);
            subTo(b, d, b);
        }
        else {
            subTo(v, u, v);
            if (ac)
                subTo(c, a, c);
            subTo(d, b, d);
        }
    }
    if (compare(v, ONE) !== 0)
        return ZERO;
    if (compare(d, m) >= 0)
        return subtract(d, m);
    if (sig(d) < 0)
        addTo(d, m, d);
    else
        return d;
    if (sig(d) < 0)
        return add(d, m);
    else
        return d;
}

function testBit(x, n) {
    var j = Math.floor(n / DB);
    if (j >= x.t)
        return (x.s !== 0);
    return ((x[j] & (1 << (n % DB))) !== 0);
}

function nothing(x) {
    return x;
}

function extend(c, o) {
    for (var i in o)
        c.prototype[i] = o[i];
} // </editor-fold>

/*
    * Classic, Barret, Mongomery reductions, optimized ExpMod algorithms
    * optimized release of http://www-cs-students.stanford.edu/~tjw/jsbn/jsbn2.js
    *
    */ // <editor-fold defaultstate="collapsed">

// Classic reduction
var Classic = function (m) {
    this.m = m;
};

extend(Classic, {
    convert: function (x) {
        if (x.s < 0 || compare(x, this.m) >= 0)
            return mod(x, this.m);
        else
            return x;
    },
    revert: nothing,
    reduce: function (x) {
        modTo(x, this.m, x);
    },
    sqrTo: function (x, r) {
        sqrTo(x, r);
        this.reduce(r);
    },
    mulTo: function (x, y, r) {
        mulTo(x, y, r);
        this.reduce(r);
    }
});

function invDig(a) {
    if (a.t < 1)
        return 0;
    var x = a[0];
    if ((x & 1) === 0)
        return 0;
    var y = x & 3;
    y = (y * (2 - (x & 0xf) * y)) & 0xf;
    y = (y * (2 - (x & 0xff) * y)) & 0xff;
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
    y = (y * (2 - x * y % DV)) % DV;
    return (y > 0) ? DV - y : -y;
}

// Montgomery reduction
var Montgomery = function (m) {
    this.m = m;
    this.mp = invDig(m);
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (DB - 15)) - 1;
    this.mt2 = 2 * m.t;
};

extend(Montgomery, {
    // xR mod m
    convert: function (x) {
        var r = nbi(x.t);
        dshlTo(abs(x), this.m.t, r);
        divRemTo(r, this.m, null, r);
        if (x.s < 0 && compare(r, ZERO) > 0)
            subTo(this.m, r, r);
        return r;
    },
    // x/R mod m
    revert: function (x) {
        var r = nbi(x.t);
        copyTo(x, r);
        this.reduce(r);
        return r;
    },
    // x = x/R mod m (HAC 14.32)
    reduce: function (x) {
        while (x.t <= this.mt2)
            x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            var j = x[i] & 0x7fff;
            var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & DM;
            j = i + this.m.t;
            x[j] += am(this.m, 0, u0, x, i, 0, this.m.t);
            while (x[j] >= DV) {
                x[j] -= DV;
                x[++j]++;
            }
        }
        clamp(x);
        dshrTo(x, this.m.t, x);
        if (compare(x, this.m) >= 0)
            subTo(x, this.m, x);
    },
    // r = "x^2/R mod m"; x != r
    sqrTo: function (x, r) {
        sqrTo(x, r);
        this.reduce(r);
    },
    // r = "xy/R mod m"; x,y != r
    mulTo: function (x, y, r) {
        mulTo(x, y, r);
        this.reduce(r);
    }
});

function dAddOffset(x, n, w) {
    if (n === 0)
        return;
    while (x.t <= w)
        x[x.t++] = 0;
    x[w] += n;
    while (x[w] >= DV) {
        x[w] -= DV;
        if (++w >= x.t)
            x[x.t++] = 0;
        ++x[w];
    }
}

function mulLowerTo(x, a, n, r) {
    var i = Math.min(x.t + a.t, n);
    r.s = 0; // assumes a,x >= 0
    r.t = i;
    while (i > 0)
        r[--i] = 0;
    var j;
    for (j = r.t - x.t; i < j; ++i)
        r[i + x.t] = am(x, 0, a[i], r, i, 0, x.t);
    for (j = Math.min(a.t, n); i < j; ++i)
        am(x, 0, a[i], r, i, 0, n - i);
    return clamp(r);
}

function mulUpperTo(x, a, n, r) {
    --n;
    var i = r.t = x.t + a.t - n;
    r.s = 0; // assumes a,x >= 0
    while (--i >= 0)
        r[i] = 0;
    for (i = Math.max(n - x.t, 0); i < a.t; ++i)
        r[x.t + i - n] = am(x, n - i, a[i], r, 0, 0, x.t + i - n);
    clamp(r);
    return dshrTo(r, 1, r);
}

// Barrett modular reduction
function Barrett(m) {
    // setup Barrett
    this.r2 = nbi(2 * m.t);
    this.q3 = nbi(2 * m.t);
    dshlTo(ONE, 2 * m.t, this.r2);
    this.mu = div(this.r2, m);
    this.m = m;
}

extend(Barrett, {
    convert: function (x) {
        if (x.s < 0 || x.t > 2 * this.m.t)
            return mod(x, this.m);
        else if (compare(x, this.m) < 0)
            return x;
        else {
            var r = nbi(x.t);
            copyTo(x, r);
            this.reduce(r);
            return r;
        }
    },
    revert: function (x) {
        return x;
    },
    // x = x mod m (HAC 14.42)
    reduce: function (x) {
        dshrTo(x, this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;
            clamp(x);
        }
        mulUpperTo(this.mu, this.r2, this.m.t + 1, this.q3);
        mulLowerTo(this.m, this.q3, this.m.t + 1, this.r2);
        while (compare(x, this.r2) < 0)
            dAddOffset(x, 1, this.m.t + 1);
        subTo(x, this.r2, x);
        while (compare(x, this.m) >= 0)
            subTo(x, this.m, x);
    },
    // r = x^2 mod m; x != r
    sqrTo: function (x, r) {
        sqrTo(x, r);
        this.reduce(r);
    },
    // r = x*y mod m; x,y != r
    mulTo: function (x, y, r) {
        mulTo(x, y, r);
        this.reduce(r);
    }

});

// x^e % m (HAC 14.85)
function expMod(x, e, m) {
    var i = bitLength(e), k, r = nbv(1), z;
    if (i <= 0)
        return r;
    else if (i < 18)
        k = 1;
    else if (i < 48)
        k = 3;
    else if (i < 144)
        k = 4;
    else if (i < 768)
        k = 5;
    else
        k = 6;
    if (i < 8)
        z = new Classic(m);
    else if (isEven(m))
        z = new Barrett(m);
    else
        z = new Montgomery(m);

    // precomputation
    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
    g[1] = z.convert(x);
    if (k > 1) {
        var g2 = nbi(m.t * 2);
        z.sqrTo(g[1], g2);
        while (n <= km) {
            g[n] = nbi(m.t * 2);
            z.mulTo(g2, g[n - 2], g[n]);
            n += 2;
        }
    }

    var j = e.t - 1, w, is1 = true, r2 = nbi(m.t * 2), t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
        if (i >= k1)
            w = (e[j] >> (i - k1)) & km;
        else {
            w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
            if (j > 0)
                w |= e[j - 1] >> (DB + i - k1);
        }

        n = k;
        while ((w & 1) == 0) {
            w >>= 1;
            --n;
        }
        if ((i -= n) < 0) {
            i += DB;
            --j;
        }
        if (is1) {	// ret == 1, don't bother squaring or multiplying it
            copyTo(g[w], r);
            is1 = false;
        }
        else {
            while (n > 1) {
                z.sqrTo(r, r2);
                z.sqrTo(r2, r);
                n -= 2;
            }
            if (n > 0)
                z.sqrTo(r, r2);
            else {
                t = r;
                r = r2;
                r2 = t;
            }
            z.mulTo(r2, g[w], r);
        }
        while (j >= 0 && (e[j] & (1 << i)) == 0) {
            z.sqrTo(r, r2);
            t = r;
            r = r2;
            r2 = t;
            if (--i < 0) {
                i = DB - 1;
                --j;
            }
        }
    }
    return z.revert(r);
} // </editor-fold>

/*
    * EC Field Elements, Points, Curves
    * optimized release of http://www-cs-students.stanford.edu/~tjw/jsbn/ec.js
    *
    */ // <editor-fold defaultstate="collapsed">

// EC Field Elemets
function newFE(a, x) {
    a.r.reduce(x);
    x.q = a.q;
    x.r = a.r;
    return x;
}

function copyFE(a, x) {
    x.q = a.q;
    x.r = a.r;
    return x;
}

function negFE(a) {
    return copyFE(a, sub(a.q, a));
}

function addFE(a, b) {
    var r = add(a, b);
    if (compare(r, a.q) > 0)
        subTo(r, a.q, r);
    return copyFE(a, r);
}

function subFE(a, b) {
    var r = sub(a, b);
    if (r.s < 0)
        addTo(a.q, r, r);
    return copyFE(a, r);
}

function mulFE(a, b) {
    return newFE(a, mul(a, b));
}

function sqrFE(a) {
    return newFE(a, sqr(a));
}

function shlFE(a, i) {
    return newFE(a, shl(a, i));
}

function invFE(a) {
    return copyFE(a, invMod(a, a.q));
}

// EC Points
function newEC(curve, x, y, z) {
    return {
        curve: curve,
        x: x,
        y: y,
        z: z || newFE(curve, ONE)
    };
}

function getX(point) {
    if (!point.zinv)
        point.zinv = invFE(point.z);
    return mulFE(point.x, point.zinv);
}

function getY(point) {
    if (!point.zinv)
        point.zinv = invFE(point.z);
    return mulFE(point.y, point.zinv);
}

function isInfinity(a) {
    if ((!a.x) && (!a.y))
        return true;
    return isZero(a.z) && !isZero(a.y);
}

function getInfinity(a) {
    return a.curve.infinity;
}

function equalsEC(a, b) {
    if (a === b)
        return true;
    if (isInfinity(a))
        return isInfinity(b);
    if (isInfinity(b))
        return isInfinity(a);
    var u, v;
    // u = Y2 * Z1 - Y1 * Z2
    u = subFE(mulFE(b.y, a.z), mulFE(a.y, b.z));
    if (!isZero(u))
        return false;
    // v = X2 * Z1 - X1 * Z2
    v = subFE(mulFE(b.x, a.z), mulFE(a.x, b.z));
    return isZero(v);
}

function negEC(a) {
    return newEC(a.curve, a.x, negFE(a.y), a.z);
}

function addEC(a, b) {
    if (isInfinity(a))
        return b;
    if (isInfinity(b))
        return a;

    // u = Y2 * Z1 - Y1 * Z2
    var u = subFE(mulFE(b.y, a.z), mulFE(a.y, b.z));
    // v = X2 * Z1 - X1 * Z2
    var v = subFE(mulFE(b.x, a.z), mulFE(a.x, b.z));

    if (isZero(v)) {
        if (isZero(u)) {
            return twiceEC(a); // a == b, so double
        }
        return getInfinity(a); // a = -b, so infinity
    }

    var x1 = a.x;
    var y1 = a.y;

    var v2 = sqrFE(v);
    var v3 = mulFE(v2, v);
    var x1v2 = mulFE(x1, v2);
    var zu2 = mulFE(sqrFE(u), a.z);

    // x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
    var x3 = mulFE(subFE(mulFE(subFE(zu2, shlFE(x1v2, 1)), b.z), v3), v);
    // y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
    var y3 = addFE(mulFE(subFE(subFE(mulFE(mulFE(x1v2, THREE), u), mulFE(y1, v3)), mulFE(zu2, u)), b.z), mulFE(u, v3));
    // z3 = v^3 * z1 * z2
    var z3 = mulFE(mulFE(v3, a.z), b.z);

    return newEC(a.curve, x3, y3, z3);
}

function twiceEC(b) {
    if (isInfinity(b))
        return b;
    if (sig(b.y) === 0)
        return getInfinity(b);

    var x1 = b.x;
    var y1 = b.y;

    var y1z1 = mulFE(y1, b.z);
    var y1sqz1 = mulFE(y1z1, y1);
    var a = b.curve.a;

    // w = 3 * x1^2 + a * z1^2
    var w = mulFE(sqrFE(x1), THREE);
    if (!isZero(a)) {
        w = addFE(w, mulFE(sqrFE(b.z), a));
    }

    // x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
    var x3 = mulFE(shlFE(subFE(sqrFE(w), mulFE(shlFE(x1, 3), y1sqz1)), 1), y1z1);
    // y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
    var y3 = subFE(mulFE(shlFE(subFE(mulFE(mulFE(w, THREE), x1), shlFE(y1sqz1, 1)), 2), y1sqz1), mulFE(sqrFE(w), w));
    // z3 = 8 * (y1 * z1)^3
    var z3 = shlFE(mulFE(sqrFE(y1z1), y1z1), 3);

    return newEC(b.curve, x3, y3, z3);
}

// Simple NAF (Non-Adjacent Form) multiplication algorithm
function mulEC(a, k) {
    if (isInfinity(a))
        return a;
    if (sig(k) === 0)
        return getInfinity(a);

    var e = k;
    var h = mul(e, THREE);

    var neg = negEC(a);
    var R = a;

    var i;
    for (i = bitLength(h) - 2; i > 0; --i) {
        R = twiceEC(R);

        var hBit = testBit(h, i);
        var eBit = testBit(e, i);

        if (hBit !== eBit) {
            R = addEC(R, hBit ? a : neg);
        }
    }

    return R;
}

function mul2AndAddEC(a, k) {
    var nbits = bitLength(k);
    var R = a,
            Q = getInfinity(a);

    for (var i = 0; i < nbits - 1; i++) {
        if (testBit(k, i) === 1)
            Q = addEC(Q, R);

        R = twiceEC(R);
    }

    if (testBit(k, nbits - 1) === 1)
        Q = addEC(Q, R);

    return Q;
}

// Compute a*j + x*k (simultaneous multiplication)
function mulTwoEC(a, j, x, k) {
    var i;
    if (bitLength(j) > bitLength(k))
        i = bitLength(j) - 1;
    else
        i = bitLength(k) - 1;

    var R = getInfinity(a);
    var both = addEC(a, x);
    while (i >= 0) {
        R = twiceEC(R);
        if (testBit(j, i)) {
            if (testBit(k, i)) {
                R = addEC(R, both);
            }
            else {
                R = addEC(R, a);
            }
        }
        else {
            if (testBit(k, i)) {
                R = addEC(R, x);
            }
        }
        --i;
    }

    return R;
}

// EC Curve
function newCurve(q, a, b) {
    var curve = {};
    curve.q = q;
    curve.r = new Barrett(q);
    curve.a = newFE(curve, a);
    curve.b = newFE(curve, b);
    curve.infinity = newEC(curve);
    return curve;
} // </editor-fold>

/*
    * Converion tools (hex, binary)
    *
    */ // <editor-fold defaultstate="collapsed">

function atobi(d) {
    var k = 8;
    var a = new Uint8Array(d);
    var r = nbi(a.length * 8 / DB);
    r.t = 0;
    r.s = 0;
    var sh = 0;
    for (var i = 0, n = a.length; i < n; i++) {
        var x = a[i];
        if (sh === 0)
            r[r.t++] = x;
        else if (sh + k > DB) {
            r[r.t - 1] |= (x & ((1 << (DB - sh)) - 1)) << sh;
            r[r.t++] = (x >> (DB - sh));
        }
        else
            r[r.t - 1] |= x << sh;
        sh += k;
        if (sh >= DB)
            sh -= DB;
    }
    return clamp(r);
}

function bitoa(s, bitLength) {
    var k = 8;
    var km = (1 << k) - 1, d, m = false, r = [], i = s.t;
    var p = DB - (i * DB) % k;
    if (i-- > 0) {
        if (p < DB && (d = s[i] >> p) > 0) {
            m = true;
            r.push(d);
        }
        while (i >= 0) {
            if (p < k) {
                d = (s[i] & ((1 << p) - 1)) << (k - p);
                d |= s[--i] >> (p += DB - k);
            }
            else {
                d = (s[i] >> (p -= k)) & km;
                if (p <= 0) {
                    p += DB;
                    --i;
                }
            }
            if (d > 0)
                m = true;
            if (m)
                r.push(d);
        }
    }
    var r8 = new Uint8Array(bitLength ? bitLength / 8 : r.length);
    if (m)
        r8.set(r.reverse());
    return r8.buffer;
}


function htobi(s) {
    if (typeof s === 'number' || s instanceof Number)
        return nbv(s);
    s = s.replace(/[^\-A-Fa-f0-9]/g, '');
    if (!s)
        s = '0';
    var k = 4;
    var r = nbi(s.length / 7);
    var i = s.length, mi = false, sh = 0;
    while (--i >= 0) {
        var c = s.charAt(i);
        if (c === '-') {
            mi = true;
            continue;
        }
        var x = parseInt(s.charAt(i), 16);
        mi = false;
        if (sh === 0)
            r[r.t++] = x;
        else if (sh + k > DB) {
            r[r.t - 1] |= (x & ((1 << (DB - sh)) - 1)) << sh;
            r[r.t++] = (x >> (DB - sh));
        }
        else
            r[r.t - 1] |= x << sh;
        sh += k;
        if (sh >= DB)
            sh -= DB;
    }
    if (mi)
        subTo(ZERO, r, r);
    return clamp(r);
}

function bitoh(x) {
    if (x.s < 0)
        return "-" + bitoh(negTo(x, nbi(x.t)));
    var k = 4;
    var km = (1 << k) - 1, d, m = false, r = "", i = x.t;
    var p = DB - (i * DB) % k;
    if (i-- > 0) {
        if (p < DB && (d = x[i] >> p) > 0) {
            m = true;
            r = d.toString(16);
        }
        while (i >= 0) {
            if (p < k) {
                d = (x[i] & ((1 << p) - 1)) << (k - p);
                d |= x[--i] >> (p += DB - k);
            }
            else {
                d = (x[i] >> (p -= k)) & km;
                if (p <= 0) {
                    p += DB;
                    --i;
                }
            }
            if (d > 0)
                m = true;
            if (m)
                r += d.toString(16);
        }
    }
    return "0x" + (m ? r : "0");
}

// biginteger to big-endian integer bytearray
function bitoi(s) {
    var i = s.t, r = [];
    r[0] = s.s;
    var p = DB - (i * DB) % 8, d, k = 0;
    if (i-- > 0) {
        if (p < DB && (d = s[i] >> p) !== (s.s & DM) >> p)
            r[k++] = d | (s.s << (DB - p));
        while (i >= 0) {
            if (p < 8) {
                d = (s[i] & ((1 << p) - 1)) << (8 - p);
                d |= s[--i] >> (p += DB - 8);
            }
            else {
                d = (s[i] >> (p -= 8)) & 0xff;
                if (p <= 0) {
                    p += DB;
                    --i;
                }
            }
            if ((d & 0x80) !== 0)
                d |= -256;
            if (k === 0 && (s.s & 0x80) !== (d & 0x80))
                ++k;
            if (k > 0 || d !== s.s)
                r[k++] = d;
        }
    }
    return new Uint8Array(r).buffer;
}

// big-endian integer bytearray to biginteger
function itobi(d) {
    var k = 8, s = new Uint8Array(d),
            r = nbi(s.length / 7);
    r.t = 0;
    r.s = 0;
    var i = s.length, sh = 0;
    while (--i >= 0) {
        var x = s[i] & 0xff;
        if (sh === 0)
            r[r.t++] = x;
        else if (sh + k > DB) {
            r[r.t - 1] |= (x & ((1 << (DB - sh)) - 1)) << sh;
            r[r.t++] = (x >> (DB - sh));
        }
        else
            r[r.t - 1] |= x << sh;
        sh += k;
        if (sh >= DB)
            sh -= DB;
    }
    if ((s[0] & 0x80) !== 0) {
        r.s = -1;
        if (sh > 0)
            r[r.t - 1] |= ((1 << (DB - sh)) - 1) << sh;
    }
    return clamp(r);
}


// Swap bytes in buffer
function swap(s) {
    var src = new Uint8Array(s),
            dst = new Uint8Array(src.length);
    for (var i = 0, n = src.length; i < n; i++)
        dst[n - i - 1] = src[i];
    return dst.buffer;
}

// Calculate hash of data
function hash(d) {
    if (this.hash)
        d = this.hash.digest(d);
    // Swap hash for SignalCom
    if (this.procreator === 'SC' ||
            (this.procreator === 'VN' && this.hash.version === 2012))
        d = swap(d);
    return d;
}

// Check buffer
function buffer(d) {
    if (d instanceof CryptoOperationData)
        return d;
    else if (d && d?.buffer instanceof CryptoOperationData)
        return d.byteOffset === 0 && d.byteLength === d.buffer.byteLength ?
                d.buffer : new Uint8Array(new Uint8Array(d, d.byteOffset, d.byteLength)).buffer;
    else
        throw new DataError('CryptoOperationData or CryptoOperationDataView required');
}

// Check double buffer
function to2(d) {
    var b = buffer(d);
    if (b.byteLength % 2 > 0)
        throw new DataError('Buffer length must be even');
    var n = b.byteLength / 2;
    return [atobi(new Uint8Array(b, 0, n)), atobi(new Uint8Array(b, n, n))];
}

function from2(x, y, bitLength) {
    var a = bitoa(x, bitLength),
            b = bitoa(y, bitLength),
            d = new Uint8Array(a.byteLength + b.byteLength);
    d.set(new Uint8Array(a));
    d.set(new Uint8Array(b), a.byteLength);
    return d.buffer;
}

function getSeed(length) {
    GostRandom = GostRandom || root.GostRandom;
    var randomSource = GostRandom ? new (GostRandom || root.GostRandom) : rootCrypto;
    if (randomSource.getRandomValues) {
        var d = new Uint8Array(Math.ceil(length / 8));
        randomSource.getRandomValues(d);
        return d;
    } else
        throw new NotSupportedError('Random generator not found');
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * The sign method returns sign data generated with the supplied privateKey.<br>
 *
 * @memberOf GostSign
 * @method sign
 * @instance
 * @param {(CryptoOperationData|TypedArray)} privateKey Private key
 * @param {(CryptoOperationData|TypedArray)} data Data
 * @returns {CryptoOperationData} Signature
 */
function sign(privateKey, data) // <editor-fold defaultstate="collapsed">
{

    // Stage 1
    var b = buffer(data);
    var alpha = atobi(hash.call(this, b));

    var q = this.q;
    var x = mod(atobi(buffer(privateKey)), q);

    // Stage 2
    var e = mod(alpha, q);
    if (isZero(e))
        e = ONE;

    var s = ZERO;
    while (isZero(s)) {
        var r = ZERO;
        while (isZero(r)) {

            // Stage 3
            var k = mod(atobi(this.ukm ||
                    getSeed(this.bitLength)), q); // pseudo random 0 < k < q
            // Stage 4
            if (this.curve) {
                // Gost R 34.10-2001 || Gost R 34.10-2012
                var P = this.P;
                var C = mulEC(P, k);
                r = mod(getX(C), q);
            } else {
                // Gost R 34.10-94
                var p = this.p, a = this.a;
                r = mod(expMod(a, k, p), q);
            }
        }
        // Stage 5
        s = mod(add(mul(r, x), mul(k, e)), q);
    }
    // Stage 6
    // console.log('s', bitoh(s));
    // console.log('r', bitoh(r));
    var zetta;
    // Integer structure for SignalCom algorithm
    if (this.procreator === 'SC') {
        zetta = {
            r: bitoh(r),
            s: bitoh(s)
        };
    } else {
        zetta = from2(r, s, this.bitLength);
        // Swap bytes for CryptoPro algorithm
        if (this.procreator === 'CP' || this.procreator === 'VN')
            zetta = swap(zetta);
    }
    return zetta;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * The verify method returns signature verification for the supplied publicKey.<br>
 *
 * @memberOf GostSign
 * @method sign
 * @instance
 * @param {(CryptoOperationData|TypedArray)} publicKey Public key
 * @param {(CryptoOperationData|TypedArray)} signature Signature
 * @param {(CryptoOperationData|TypedArray)} data Data
 * @returns {boolean} Signature verified = true
 */
function verify(publicKey, signature, data) // <editor-fold defaultstate="collapsed">
{

    // Stage 1
    var q = this.q;
    var r, s;
    // Ready int for SignalCom algorithm
    if (this.procreator === 'SC') {
        r = htobi(signature.r);
        s = htobi(signature.s);
    } else {
        if (this.procreator === 'CP' || this.procreator === 'VN')
            signature = swap(signature);
        var zetta = to2(signature);
        // Swap bytes for CryptoPro algorithm
        s = zetta[1]; //  first 32 octets contain the big-endian representation of s
        r = zetta[0]; //  and second 32 octets contain the big-endian representation of r
    }
    if (compare(r, q) >= 0 || compare(s, q) >= 0)
        return false;
    // Stage 2
    var b = buffer(data);
    var alpha = atobi(hash.call(this, b));
    // Stage 3
    var e = mod(alpha, q);
    if (isZero(e) === 0)
        e = ONE;
    // Stage 4
    var v = invMod(e, q);
    // Stage 5
    var z1 = mod(mul(s, v), q);
    var z2 = sub(q, mod(mul(r, v), q));
    // Stage 6
    if (this.curve) {
        // Gost R 34.10-2001 || Gost R 34.10-2012
        var k2 = to2(publicKey),
                curve = this.curve,
                P = this.P,
                x = newFE(curve, k2[0]), // first 32 octets contain the little-endian representation of x
                y = newFE(curve, k2[1]), // and second 32 octets contain the little-endian representation of y.
                Q = new newEC(curve, x, y); // This corresponds to the binary representation of (<y>256||<x>256)
        var C = mulTwoEC(P, z1, Q, z2);
        var R = mod(getX(C), q);
    } else {
        // Gost R 34.10-94
        var p = this.p, a = this.a;
        var y = atobi(publicKey);
        var R = mod(mod(mul(expMod(a, z1, p), expMod(y, z2, p)), p), q);
    }
    // Stage 7
    return (compare(R, r) === 0);
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * The generateKey method returns a new generated key pair using the specified
 * AlgorithmIdentifier.
 *
 * @memberOf GostSign
 * @method generateKey
 * @instance
 * @returns {Object} Object with two CryptoOperationData members: privateKey and publicKey
 */
function generateKey() // <editor-fold defaultstate="collapsed">
{
    var curve = this.curve;
    if (curve) {

        var Q = curve.infinity;
        while (isInfinity(Q)) {

            // Generate random private key
            var d = ZERO;
            if (this.ukm) {
                d = atobi(this.ukm);
            } else {
                while (isZero(d))
                    d = mod(atobi(getSeed(this.bitLength)), this.q); // 0 < d < q
            }

            // Calculate public key
            Q = mulEC(this.P, d);
            var x = getX(Q), y = getY(Q);
            // console.log('d', bitoh(d));
            // console.log('x', bitoh(x));
            // console.log('y', bitoh(y));
        }

        // Return result
        return {
            privateKey: bitoa(d, this.bitLength),
            publicKey: from2(x, y, this.bitLength) // This corresponds to the binary representation of (<y>256||<x>256)
        };

    } else
        throw new NotSupportedError('Key generation for GOST R 34.10-94 not supported');
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10 mode MASK<br><br>
 *
 * The generateMaskKey method returns a new generated key mask using for wrapping.
 *
 * @memberOf GostSign
 * @method generateMaskKey
 * @instance
 * @returns {Object} Object with two CryptoOperationData members: privateKey and publicKey
 */
function generateMaskKey() // <editor-fold defaultstate="collapsed">
{
    var curve = this.curve;
    if (curve) {
        // Generate random private key
        var d = ZERO;
        while (isZero(d))
            d = mod(atobi(getSeed(this.bitLength)), this.q); // 0 < d < q

        // Return result
        return bitoa(d, this.bitLength);
    } else
        throw new NotSupportedError('Key generation for GOST R 34.10-94 not supported');
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * Unwrap private key from private key and ukm (mask)
 *
 * @memberOf GostSign
 * @method unwrap
 * @instance
 * @param {(CryptoOperationData|TypedArray)} baseKey Unwrapping key
 * @param {(CryptoOperationData|TypedArray)} data Wrapped key
 * @returns {Object} CryptoOperationData unwrapped privateKey
 */
function unwrapKey(baseKey, data) // <editor-fold defaultstate="collapsed">
{
    var curve = this.curve;
    if (curve) {
        var q = this.q;
        var x = mod(atobi(buffer(data)), q);
        var y = mod(atobi(buffer(baseKey)), q);
        var z = this.procreator === 'VN' ? mod(mul(x, y), q) : mod(mul(x, invMod(y, q)), q);
        return bitoa(z);
    } else
        throw new NotSupportedError('Key wrapping GOST R 34.10-94 not supported');
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * Wrap private key with private key and ukm (mask)
 *
 * @memberOf GostSign
 * @method unwrap
 * @instance
 * @param {(CryptoOperationData|TypedArray)} baseKey Wrapping key
 * @param {(CryptoOperationData|TypedArray)} data Key
 * @returns {Object} CryptoOperationData unwrapped privateKey
 */
function wrapKey(baseKey, data) // <editor-fold defaultstate="collapsed">
{
    var curve = this.curve;
    if (curve) {
        var q = this.q;
        var x = mod(atobi(buffer(data)), q);
        var y = mod(atobi(buffer(baseKey)), q);
        var z = this.procreator === 'VN' ? mod(mul(x, invMod(y, q)), q) : mod(mul(x, y), q);
        return bitoa(z);
    } else
        throw new NotSupportedError('Key wrapping GOST R 34.10-94 not supported');
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * @memberOf GostSign
 * @method derive
 * @instance
 * @private
 * @param {CryptoOperationData} baseKey Key for deriviation
 * @returns {CryptoOperationData}
 */
function derive(baseKey) // <editor-fold defaultstate="collapsed">
{

    var k, ukm = atobi(this.ukm);
    var q = this.q;
    var x = mod(atobi(buffer(baseKey)), q);

    if (this.curve) {
        // 1) Let K(x,y,UKM) = ((UKM*x)(mod q)) . (y.P) (512 bit), where
        // x - sender’s private key (256 bit)
        // x.P - sender’s public key (512 bit)
        // y - recipient’s private key (256 bit)
        // y.P - recipient’s public key (512 bit)
        // UKM - non-zero integer, produced as in step 2 p. 6.1 [GOSTR341001]
        // P - base point on the elliptic curve (two 256-bit coordinates)
        // UKM*x - x multiplied by UKM as integers
        // x.P - a multiple point
        var K = mulEC(this.peer_Q, mod(mul(ukm, x), q));
        k = from2(getX(K), getY(K), // This corresponds to the binary representation of (<y>256||<x>256)
                this.bitLength);
    } else {
        // 1) Let K(x,y) = a^(x*y) (mod p), where
        // x - sender’s private key, a^x - sender’s public key
        // y - recipient’s private key, a^y - recipient’s public key
        // a, p - parameters
        var p = this.p, a = this.a;
        k = bitoa(expMod(this.peer_y, x, p));
    }
    // 2) Calculate a 256-bit hash of K(x,y,UKM):
    // KEK(x,y,UKM) = gostSign (K(x,y,UKM)
    return hash.call(this, k);
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * The deriveBits method returns length bits on baseKey.
 *
 * @memberOf GostSign
 * @method deriveBits
 * @instance
 * @param {(CryptoOperationData|TypedArray)} baseKey Key for deriviation
 * @param {number} length output bit-length
 * @returns {CryptoOperationData} result
 */
function deriveBits(baseKey, length) // <editor-fold defaultstate="collapsed">
{
    if (length < 8 || length > this.bitLength || length % 8 > 0)
        throw new DataError('Length must be no more than ' + this.bitLength + ' bits and multiple of 8');
    var n = length / 8,
            b = derive.call(this, baseKey),
            r = new Uint8Array(n);

    r.set(new Uint8Array(b, 0, n));
    return r.buffer;
} // </editor-fold>

/**
 * Algorithm name GOST R 34.10<br><br>
 *
 * The deriveKey method returns 256 bit Key encryption key on baseKey.
 *
 * This algorithm creates a key encryption key (KEK) using 64 bit UKM,
 * the sender’s private key, and the recipient’s public key (or the
 * reverse of the latter pair
 *
 * @memberOf GostSign
 * @method deriveKey
 * @instance
 * @param {(CryptoOperationData|TypedArray)} baseKey Key for deriviation
 * @returns {CryptoOperationData} result
 */
function deriveKey(baseKey) // <editor-fold defaultstate="collapsed">
{
    var b = derive.call(this, baseKey),
            r = new Uint8Array(32);

    r.set(new Uint8Array(b, 0, 32));
    return r.buffer;
} // </editor-fold>


/**
 * Gost R 34.10 universal object<br><br>
 *
 * References: {@link http://tools.ietf.org/html/rfc6986} and {@link http://tools.ietf.org/html/rfc5831}<br><br>
 *
 * Normalized algorithm identifier common parameters:
 *
 *  <ul>
 *      <li><b>name</b> Algorithm name 'GOST R 34.10'</li>
 *      <li><b>version</b> Algorithm version
 *          <ul>
 *              <li><b>1994</b> - Old-style GOST R 34.10-94 ExpMod algorithm with GOST R 34.11-94 hash</li>
 *              <li><b>2001</b> - GOST R 34.10-2001 Eliptic curve algorithm with old GOST R 34.11-94 hash</li>
 *              <li><b>2012</b> - GOST R 34.10-2012 Eliptic curve algorithm with GOST R 34.11-12 hash, default mode</li>
 *          </ul>
 *      </li>
 *      <li><b>length</b> Length of hash and signature. Key length == hash length for EC algorithms and 2 * hash length for ExpMod algorithm
 *          <ul>
 *              <li><b>GOST R 34.10-256</b> - 256 bits digest, default mode</li>
 *              <li><b>GOST R 34.10-512</b> - 512 bits digest only for GOST R 34.11-2012 hash</li>
 *          </ul>
 *      </li>
 *      <li><b>mode</b> Algorithm mode
 *          <ul>
 *              <li><b>SIGN</b> Digital signature mode (default)</li>
 *              <li><b>DH</b> Diffie-Hellman key generation and key agreement mode</li>
 *          </ul>
 *      </li>
 *      <li><b>sBox</b> Paramset sBox for GOST 34.11-94. Used only if version = 1994 or 2001</li>
 *  </ul>
 *
 * Supported algorithms, modes and parameters:
 *
 *  <ul>
 *      <li>Sign/Verify mode (SIGN)</li>
 *      <li>DeriveKey/DeriveBits mode (DH)
 *          <ul>
 *              <li>{@link CryptoOperationData} <b>ukm</b> User key material. Default - random generated value</li>
 *              <li>{@link CryptoOperationData} <b>public</b> The peer's EC public key data</li>
 *          </ul>
 *      </li>
 *      <li>GenerateKey mode (SIGN and DH) version = 1994
 *          <ul>
 *              <li><b>namedParam</b> Paramset for key generation algorithm. If specified no additianal parameters required</li>
 *          </ul>
 *          Additional parameters, if namedParam not specified
 *          <ul>
 *              <li><b>modulusLength</b> Bit length of p (512 or 1024 bits). Default = 1024</li>
 *              <li><b>p</b> {@link CryptoOperationData} Modulus, prime number, 2^(t-1)<p<2^t</li>
 *              <li><b>q</b> {@link CryptoOperationData} Order of cyclic group, prime number, 2^254<q<2^256, q is a factor of p-1</li>
 *              <li><b>a</b> {@link CryptoOperationData} Generator, integer, 1<a<p-1, at that aq (mod p) = 1</li>
 *          </ul>
 *      </li>
 *      <li>GenerateKey mode (SIGN and DH) version = 2001 or 2012
 *          <ul>
 *              <li><b>namedCurve</b> Paramset for key generation algorithm. If specified no additianal parameters required</li>
 *          </ul>
 *          Additional EC parameters, if namedCurve not specified
 *          <ul>
 *              <li><b>p</b> {@link CryptoOperationData} Prime number - elliptic curve modulus</li>
 *              <li><b>a</b> {@link CryptoOperationData} Coefficients a of the elliptic curve E</li>
 *              <li><b>b</b> {@link CryptoOperationData} Coefficients b of the elliptic curve E</li>
 *              <li><b>q</b> {@link CryptoOperationData} Prime number - order of cyclic group</li>
 *              <li><b>x</b> {@link CryptoOperationData} Base point p x-coordinate</li>
 *              <li><b>y</b> {@link CryptoOperationData} Base point p y-coordinate</li>
 *          </ul>
 *      </li>
 *  </ul>
 *
 * @class GostSign
 * @param {AlgorithmIndentifier} algorithm
 */
function GostSign(algorithm) // <editor-fold defaultstate="collapsed">
{
    algorithm = algorithm || {};
    this.name = (algorithm.name || 'GOST R 34.10') + '-' +
            ((algorithm.version || 2012) % 100) + '-' + (algorithm.length || 256) +
            (((algorithm.mode || 'SIGN') !== 'SIGN') ? '-' + algorithm.mode : '') +
            (typeof algorithm.namedParam === 'string' ? '/' + algorithm.namedParam : '') +
            (typeof algorithm.namedCurve === 'string' ? '/' + algorithm.namedCurve : '') +
            (typeof algorithm.sBox === 'string' ? '/' + algorithm.sBox : '');

    var version = algorithm.version || 2012;

    // Functions
    switch (algorithm.mode || 'SIGN') {
        case 'SIGN':
            this.sign = sign;
            this.verify = verify;
            this.generateKey = generateKey;
            break;
        case 'DH':
            this.deriveBits = deriveBits;
            this.deriveKey = deriveKey;
            this.generateKey = generateKey;
            break;
        case 'MASK':
            this.wrapKey = wrapKey;
            this.unwrapKey = unwrapKey;
            this.generateKey = generateMaskKey;
            break;
    }

    // Define parameters
    if (version === 1994) {
        // Named or parameters algorithm
        var param = algorithm.param;
        if (!param)
            param = GostParams[this.namedParam = (algorithm.namedParam || 'S-A').toUpperCase()];
        this.modulusLength = algorithm.modulusLength || param.modulusLength || 1024;
        this.p = htobi(param.p);
        this.q = htobi(param.q);
        this.a = htobi(param.a);
        // Public key for derive
        if (algorithm['public'])
            this.peer_y = atobi(algorithm['public']);
    } else {
        // Named or parameters algorithm
        var param = algorithm.curve;
        if (!param)
            param = ECGostParams[this.namedCurve = (algorithm.namedCurve || 'S-256-A').toUpperCase()];
        var curve = this.curve = newCurve(htobi(param.p), htobi(param.a), htobi(param.b));
        this.P = newEC(curve,
                newFE(curve, htobi(param.x)),
                newFE(curve, htobi(param.y)));
        this.q = htobi(param.q);
        // Public key for derive
        if (algorithm['public']) {
            var k2 = to2(algorithm['public']);
            this.peer_Q = new newEC(this.curve, // This corresponds to the binary representation of (<y>256||<x>256)
                    newFE(this.curve, k2[0]), // first 32 octets contain the little-endian representation of x
                    newFE(this.curve, k2[1])); // and second 32 octets contain the little-endian representation of y.
        }
    }

    // Check bit length
    var hashLen, keyLen;
    if (this.curve) {
        keyLen = algorithm.length || bitLength(this.q);
        if (keyLen > 508 && keyLen <= 512)
            keyLen = 512;
        else if (keyLen > 254 && keyLen <= 256)
            keyLen = 256;
        else
            throw new NotSupportedError('Support keys only 256 or 512 bits length');
        hashLen = keyLen;
    } else {
        keyLen = algorithm.modulusLength || bitLength(this.p);
        if (keyLen > 1016 && keyLen <= 1024)
            keyLen = 1024;
        else if (keyLen > 508 && keyLen <= 512)
            keyLen = 512;
        else
            throw new NotSupportedError('Support keys only 512 or 1024 bits length');
        hashLen = 256;
    }
    this.bitLength = hashLen;
    this.keyLength = keyLen;

    // Algorithm proceator for result conversion
    this.procreator = algorithm.procreator;

    // Hash function definition
    var hash = algorithm.hash;
    if (hash) {
        if (typeof hash === 'string' || hash instanceof String)
            hash = {name: hash};
        if (algorithm.version === 1994 || algorithm.version === 2001) {
            hash.version = 1994;
            hash.length = 256;
            hash.sBox = algorithm.sBox || hash.sBox;
        } else {
            hash.version = 2012;
            hash.length = hashLen;
        }
        hash.procreator = hash.procreator || algorithm.procreator;

        if (!GostDigest)
            GostDigest = root.GostDigest;
        if (!GostDigest)
            throw new NotSupportedError('Object GostDigest not found');

        this.hash = new GostDigest(hash);
    }

    // Pregenerated seed for key exchange algorithms
    if (algorithm.ukm) // Now don't check size
        this.ukm = algorithm.ukm;

} // </editor-fold>

export default GostSign;
