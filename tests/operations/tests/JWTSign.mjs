/**
 * JWT Sign tests
 *
 * @author gchq77703 []
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const inputObject = JSON.stringify({
    String: "SomeString",
    Number: 42,
    iat: 1
}, null, 4);

const hsKey = "secret_cat";
const rsKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDnBZHfKzx27jc+
9cFPj3b42HO8auxjtlpJpiWgMluSJi8ECrN3iIODf5H9xf1Np61+4xtz3SDKibdA
XgB9rhXRz6LcRNN962QtIvKriI+Mr9EEaAwNFYziZ8bhDVgawheWCqSJO0DjDDDk
0CTbfl7SeIhcTuoPXeWFQICUsyc6w3uE+KWnnPZnK9l3R02ssBjsqQhf3LZ9bz04
52ahhuBg1BgBOIeu8Y8hzTAjsOuMDZ7XV8MbEpcmOYRy46vEjRTl3ZIpYoS0v5st
M60swjnPiv43oBAsziVddIJWnh+TnBacnuhHl7amuGCLspogftJGefuGDNxIJOLH
mPaO5R7vAgMBAAECggEADZn32SZQBIaI7SWF8Ju3OvZvdffrnAFH9o8YJwLf/k5O
NVQ19cMtTwgrPcAy5igJoG9Zlew+en46Mkl2iO+/bB9n7MUGmKLLvpaQqAW9weA2
E6bWksyig0/t1yE0fzrPLa/JuSSqcNOua0JP8TZS+dxL1vd0c1wpX7uI9nhHxn9Q
OJNY6N+ebeIjEugYJaeaLWj6cQ1x9V0+JealQtlra4Xex/CwczqPLKD01bdPe/Fn
5iLG8/dIofHz+615UTC52vwKaL2JiWUHX9gBlahrZYOuhxJQ1RRAf03+Ij2hyUwa
tOKglPZIhDajALfU3qSfOfRHnMKpakdA9tiZ1TTIvQKBgQD5lUvlZOfY/WdkHl3u
RnF3g/lWT4dRzdcezeYkLAdYcu5Q1ExVlYPezA9tYD2uR7cziJy/em1v0tPXzCSL
+BGB8/Ds4wg3QYnV8RXgI/4XxXf2iNbfJEfJ74nxza1/9L9Bnvg1OZLcdagu+Ria
p8y3hWzbBie52o0T8s/KDo2/PQKBgQDs9hseyloiDqsmW7hfLw+AiH1IGwXgK53b
ZeBwtASr7SYD1Ej0xFZ5SZ/OukjdDAQoyrivpjPcCjXxR1eoCA857S/+sSRPk+Gw
3+9lWys7jd4VEWvQgV7PKwGGVc1Ku/aKjNbNnu4HxbQfb7bJZnvoW8WqsqHhT/2z
bFnuYVD5mwKBgQC88adpXECg5wX0p4CYuD+CKSkDjGV3KoumyF1oGOTesvNzwaSg
TfZtHrK3LNrFK4mnu85erwJWW5cAkY1BYWVvqgtEaoN3wWflzQOwkc70lAvDWcjB
WSf32h3mLr0gV1rLBNwG/zUNLQ1LskxMGKhEbv//t+MvMiMHbRSddPMeSQKBgQDm
H8QKzP1nodM4905AshVeAC+a/RNhtzogvfmPumPnC/IlOd54RsysEYIvY94rPeY0
L1vYyZIHmar1XRGVz+3plZ1MvX/EAJvoCDIXvshnl8kbsMWBwoHus5dRfLZYY950
g36ARl5oEepxtS5QvUSMTcPTmJN5mxOJUiqsRLo9DQKBgQDyOatwmZLrWs8Sipet
pdJpPnBJ1TE+Dm1WmaUfmjoXJxi07Bfikex5ybqqed49s5TSb2OBU4eG/yVLQcix
ik0m4tG0NSEJ/EgfwUxdteHSjGmWnuiK0r3oAz6ffE32RfqvEoFRcCh/H8MdkVtg
ErVnxmpzv5elRSZ/DUn2uygxgA==
-----END PRIVATE KEY-----`;
const es256Key = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIA3ISxaDm/NdIVmkuAWR5VTNNj2PTpe+eWhv2rUhNE9joAoGCCqGSM49
AwEHoUQDQgAEY5Iad2fwtKm40eqg+hx4sxwsZwKm0WP/GDNGAPUisD3H2AlLedYE
+xZ8cehEKjddb6Bftv0I3PLGFMBQIyE0pA==
-----END EC PRIVATE KEY-----`;
const es384Key = `-----BEGIN EC PRIVATE KEY-----
MIGkAgEBBDAp0jx0wSk6L2od/DbovYvrhG/AKXAFpqaQ7/u8tgg7w0lBHWrA9yHF
YG1Z0k5lEACgBwYFK4EEACKhZANiAASYGNRZMaBebhOkwML7V4JJgiXqukoopqun
xXWTCEw4qCEqydsXE6TFVB2RJ0+hpjoK00XqVVvyv8fw6ZYH9y5dHmj0RsnBMrAm
oOhhUpXlZWsfiY97db80mKCp7n2MkNw=
-----END EC PRIVATE KEY-----`;
const es512Key = `-----BEGIN EC PRIVATE KEY-----
MIHcAgEBBEIARI9C6QrByhpJ8paMAgKyz6piOIEF2wDxlPEFcVC3ZHSo4crE2Uc5
E94EOuLNnKs/TinGMiTUhbefpfETI5SML4qgBwYFK4EEACOhgYkDgYYABADka9q3
ZXy2j1ml6fQqFbG6ryD2+2Cu43xxDeEoec9PW4Dfe/hmkluYwSv15X5+VhBx36sh
Jeh34sXjACyMVXfLGQGS3Puxol0c1nyC1uv9ecxLJmWUtUmPm9Uz87tb3vhI636x
8YT3MpqHkOZnDm4CiG09QIS9ROUHKH/BGQ7QtH/9yA==
-----END EC PRIVATE KEY-----`;

TestRegister.addTests([
    {
        name: "JWT Sign: HS256",
        input: inputObject,
        expectedOutput: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.0ha6-j4FwvEIKPVZ-hf3S_R9Hy_UtXzq4dnedXcUrXk",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS256", "{}"],
            }
        ],
    },
    {
        name: "JWT Sign: HS256 with custom header",
        input: inputObject,
        expectedOutput: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImN1c3RvbS5rZXkifQ.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.kXln8btJburfRlND8IDZAQ8NZGFFZhvHyooHa6N9za8",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS256", `{"kid":"custom.key"}`],
            }
        ],
    },
    {
        name: "JWT Sign: HS384",
        input: inputObject,
        expectedOutput: "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ._bPK-Y3mIACConbJqkGFMQ_L3vbxgKXy9gSxtL9hA5XTganozTSXxD0vX0N1yT5s",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS384", "{}"],
            }
        ],
    },
    {
        name: "JWT Sign: HS512",
        input: inputObject,
        expectedOutput: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.vZIJU4XYMFt3FLE1V_RZOxEetmV4RvxtPZQGzJthK_d47pjwlEb6pQE23YxHFmOj8H5RLEdqqLPw4jNsOyHRzA",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS512", "{}"],
            }
        ],
    },
    {
        name: "JWT Sign: ES256",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [es256Key, "ES256", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: ES384",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [es384Key, "ES384", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: ES512",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [es512Key, "ES512", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: RS256",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey, "RS256", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: RS384",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey, "RS384", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: RS512",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey, "RS512", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    }
]);
