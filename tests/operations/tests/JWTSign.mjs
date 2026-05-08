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
const rsKey1024 = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw
33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW
+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQAB
AoGAD+onAtVye4ic7VR7V50DF9bOnwRwNXrARcDhq9LWNRrRGElESYYTQ6EbatXS
3MCyjjX2eMhu/aF5YhXBwkppwxg+EOmXeh+MzL7Zh284OuPbkglAaGhV9bb6/5Cp
uGb1esyPbYW+Ty2PC0GSZfIXkXs76jXAu9TOBvD0ybc2YlkCQQDywg2R/7t3Q2OE
2+yo382CLJdrlSLVROWKwb4tb2PjhY4XAwV8d1vy0RenxTB+K5Mu57uVSTHtrMK0
GAtFr833AkEA6avx20OHo61Yela/4k5kQDtjEf1N0LfI+BcWZtxsS3jDM3i1Hp0K
Su5rsCPb8acJo5RO26gGVrfAsDcIXKC+bQJAZZ2XIpsitLyPpuiMOvBbzPavd4gY
6Z8KWrfYzJoI/Q9FuBo6rKwl4BFoToD7WIUS+hpkagwWiz+6zLoX1dbOZwJACmH5
fSSjAkLRi54PKJ8TFUeOP15h9sQzydI8zJU+upvDEKZsZc/UhT/SySDOxQ4G/523
Y0sz/OZtSWcol/UMgQJALesy++GdvoIDLfJX5GBQpuFgFenRiRDabxrE9MNUZ2aP
FaFp+DyAe+b4nDwuJaW2LURbr8AEZga7oQj0uYxcYw==
-----END RSA PRIVATE KEY-----`;
const rsKey2048 = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAk0VOoksAblwP82DALTG6xGC86Hfho3nChbcPGWyqn+ScfHBF
cg3SeKyy6aWCyLcKfNwE5cPYzuYvVBsZyIrdfFOuV90D/aRYbuw6UkKR3cmmy9qE
qvu05dogvc0BcmkwbC37Q8JnsZBRcosoLGgTFxcK+LXdsG7DukajpsGesxQjOLb2
1jnx+ypzx74xvj7grqlXkxeDKr22q7QkO3A1ApoOuJRAU+SjEEZmqdXzRery2RWx
hkWbCXuQw4PnW5Lh3Wwabnu7XKVIa6wJa1pqL2IAxmlZ0bvGTfjtO5ggNfgJk5V4
bGSOXnsplpG71AWMrK2q6NqHjFIE1szEycUKrwIDAQABAoIBAAivyt6Zy/G2g8kC
852hfvcRubLV92eRdAmNGFqTOqaUcS00i3QZyp4MRGqxtOV/88y/nEOtP1RHkZJw
HXTjHq4JsDvwhnQR8JbCX6z1zkLQdS01u3jrwJTaPpooxdATfPlfO6CYjqM+SapB
o7dS1ZAZb4U8vPx+MWoDEVNxvO7/xyqho1Oc4H9MwqQUiyG2WfIoqxLSrBYcambv
RmySwTIpgQZTr61EeWf/0eWpV0iEYbSnkB/VaKW+5tg4gCjPgy5v6/LQ0u/pzlYz
ayCL3xN2rp0tigXsiiWz3cM5gDsnatK4nVNRs9y3JSZpWpI236ZfZjs8Lts+WBUw
hAEoE9kCgYEAyEIGD1A7R/t5EYk5HhHDH5tGdyxejAcQL5AIz0YnTZU8Iixyc7FR
uDmAMiuKIcJY/nUlxZjSxNc3MkOfZNggQvf9ONrt+ftQ1yyTjv+019NfU4w4d0Ep
LNaiAHgaPKimBUZjYXbLgiMXj/1pBaQmgUYTK/VlO3PVdowxxzxMYlMCgYEAvEOG
GrhVaQV1nAYx86BgZ3wn90hBFXZWGaN+eXUmyrast93Ih3TCSgQDKPuN3pdv/TIe
cpQv/BxEMpW+6d5Z1NP3GbrLpaZUiUNk8fqw1S3pmD5aWZrYIUaNukAyOxnZVgjv
EWD9QTpI663gODaeZZTkDYiRNzTzGOg5HtzporUCgYBBOphEtqqImNXnq13qeHip
O+eo+8/UJpzUEUN9WGmG8NxEeVvSaWin7DrgnKQCuQ5J3Biwk0XcDgoRmks6Ctf/
WE2oDk/DxGOhowhxZMMgJd6AFUVzOstRqpvcMULCjWB+iV3nqk1Bl3KeWTmzN7O/
Gfc2s1kFE4btdV7lebObtwKBgE3rkLS8eLVYCh6Cvef9CAms7Im/wRhV+zrvXWh9
4YljZEdRpy7RV5z03i33N/faLALa3JlF1jp9pIhfTD5Vxk59ULe4hZNRLYoGd+Bj
hw8kyps1q4WMvkm/fueIrIGjqD2gwvopb4iwy/+n3rbFfHfE0UL8tEXqR3eWnhW1
D4pFAoGAccR4eMJD43hJWaUQLtsj0RoW9lFKVXj7aqkIIeupXwt7Ic2z/FhCAJi+
V0MWpd3K6+kPl+ifdt8U4kcYfubPMfJhd7IkMcgQS+yZK1+5xWdRISvI8GpNwIHE
LUkVkCCadXNNZ7b1nmUKjse95u4IaE6hwAqjSTNb05gPmCfoEjg=
-----END RSA PRIVATE KEY-----`;
const esKeyP256 = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
-----END PRIVATE KEY-----`;
const esKeyP384 = `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDDpgCvB2frnLKd7TuWe
JM1ejXXmr9y/5gskxKuuylLvpQTiDdtLtuhJnvw1/zWKWO6hZANiAAQ5Crhsi5FD
t55i53dCtdzG9OzCnbDFf/6136ZfEiakDTDeWCdUvNnB3WQEcVBr97BfSWLI9mO+
T5yzm0RfhgvWIq/tBou+sIDeGp6NQfJwhDhf+JsdeF174gtfNMZGj/s=
-----END PRIVATE KEY-----`;
const esKeyP521 = `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIA0dBErrZ5ovKq4Xf/
iTlRkYxuOfgBZ6+tWIfG13YwthB1XrH06YmteZGNjHHLZEeycwUt0jM4kUb+tOsJ
3ckhj1ihgYkDgYYABACYgsa8JWKH46CQagwNw14v/L+DIs1WAjJdMXZySjKlRkD9
LtLMxkbX2H4H4Zl2KzCMJkwTSETzSKNlXvAUJqKbRwHezCp4y5XZN9MOBYdmyylZ
NOVxwwTouimNkJ0K6A8+/Im5S3PWB8Ra1D6t+bT1WHHhEePZcltSLLFlbIIyot5m
2w==
-----END PRIVATE KEY-----`;

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
                args: [esKeyP256, "ES256", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: ES384 - P256 key",
        input: inputObject,
        expectedOutput: `Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.

Error: "alg" parameter "ES384" requires curve "secp384r1".`,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [esKeyP256, "ES384", "{}"],
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
                args: [esKeyP384, "ES384", "{}"],
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
                args: [esKeyP521, "ES512", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    },
    {
        name: "JWT Sign: RS256, weak key",
        input: inputObject,
        expectedOutput: `Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.

Error: secretOrPrivateKey has a minimum key size of 2048 bits for RS256`,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey1024, "RS256", "{}"],
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
                args: [rsKey2048, "RS256", "{}"],
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
                args: [rsKey2048, "RS384", "{}"],
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
                args: [rsKey2048, "RS512", "{}"],
            },
            {
                op: "JWT Decode",
                args: []
            }
        ],
    }
]);
