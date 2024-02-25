/**
 * JWT Sign tests
 *
 * @author gchq77703 []
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const inputObject = JSON.stringify(
    {
        String: "SomeString",
        Number: 42,
        iat: 1,
    },
    null,
    4,
);

const hsKey = "secret_cat";
const rsKey = `-----BEGIN RSA PRIVATE KEY-----
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
const esKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
-----END PRIVATE KEY-----`;

TestRegister.addTests([
    {
        name: "JWT Sign: HS256",
        input: inputObject,
        expectedOutput:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.0ha6-j4FwvEIKPVZ-hf3S_R9Hy_UtXzq4dnedXcUrXk",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS256"],
            },
        ],
    },
    {
        name: "JWT Sign: HS384",
        input: inputObject,
        expectedOutput:
            "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ._bPK-Y3mIACConbJqkGFMQ_L3vbxgKXy9gSxtL9hA5XTganozTSXxD0vX0N1yT5s",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS384"],
            },
        ],
    },
    {
        name: "JWT Sign: HS512",
        input: inputObject,
        expectedOutput:
            "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJTdHJpbmciOiJTb21lU3RyaW5nIiwiTnVtYmVyIjo0MiwiaWF0IjoxfQ.vZIJU4XYMFt3FLE1V_RZOxEetmV4RvxtPZQGzJthK_d47pjwlEb6pQE23YxHFmOj8H5RLEdqqLPw4jNsOyHRzA",
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [hsKey, "HS512"],
            },
        ],
    },
    {
        name: "JWT Sign: ES256",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [esKey, "ES256"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
    {
        name: "JWT Sign: ES384",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [esKey, "ES384"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
    {
        name: "JWT Sign: ES512",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [esKey, "ES512"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
    {
        name: "JWT Sign: RS256",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey, "RS256"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
    {
        name: "JWT Sign: RS384",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [rsKey, "RS384"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
    {
        name: "JWT Sign: RS512",
        input: inputObject,
        expectedOutput: inputObject,
        recipeConfig: [
            {
                op: "JWT Sign",
                args: [esKey, "RS512"],
            },
            {
                op: "JWT Decode",
                args: [],
            },
        ],
    },
]);
