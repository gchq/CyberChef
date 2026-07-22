/**
 * RSA Encrypt Private Key tests.
 *
 * @author Fra3zz
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const PRIV_512_PKCS1 = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAPKr0Dp6YdItzOfk6a7ma7L4BF4LnelMYKtboGLrk6ihtqFPZFRL
NcJi68Hvnt8stMrP50t6jqwWQ2EjMdkj6fsCAwEAAQJAOJUpM0lv36MAQR3WAwsF
F7DOy+LnigteCvaNWiNVxZ6jByB5Qb7sall/Qlu9sFI0ZwrlVcKS0kldee7JTYlL
WQIhAP3UKEfOtpTgT1tYmdhaqjxqMfxBom0Ri+rt9ajlzs6vAiEA9L85B8/Gnb7p
6Af7/wpmafL277OV4X4xBfzMR+TUzHUCIBq+VLQkInaTH6lXL3ZtLwyIf9W9MJjf
RWeuRLjT5bM/AiBF7Kw6kx5Hy1fAtydEApCoDIaIjWJw/kC7WTJ0B+jUUQIgV6dw
NSyj0feakeD890gmId+lvl/w/3oUXiczqvl/N9o=
-----END RSA PRIVATE KEY-----`;

const PRIV_512_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA8qvQOnph0i3M5+Tp
ruZrsvgEXgud6Uxgq1ugYuuTqKG2oU9kVEs1wmLrwe+e3yy0ys/nS3qOrBZDYSMx
2SPp+wIDAQABAkA4lSkzSW/fowBBHdYDCwUXsM7L4ueKC14K9o1aI1XFnqMHIHlB
vuxqWX9CW72wUjRnCuVVwpLSSV157slNiUtZAiEA/dQoR862lOBPW1iZ2FqqPGox
/EGibRGL6u31qOXOzq8CIQD0vzkHz8advunoB/v/CmZp8vbvs5XhfjEF/MxH5NTM
dQIgGr5UtCQidpMfqVcvdm0vDIh/1b0wmN9FZ65EuNPlsz8CIEXsrDqTHkfLV8C3
J0QCkKgMhoiNYnD+QLtZMnQH6NRRAiBXp3A1LKPR95qR4Pz3SCYh36W+X/D/ehRe
JzOq+X832g==
-----END PRIVATE KEY-----`;

const PRIV_512_PKCS8_ENC = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIBrzBJBgkqhkiG9w0BBQ0wPDAbBgkqhkiG9w0BBQwwDgQILP5/Mw4jnpUCAggA
MB0GCWCGSAFlAwQBAgQQ18VGFlqTKWNfEro31Ev+UgSCAWAwara+xKGKPSNGOakz
DLST6Xhnxv6PcL1+Ei4RR65ns94ofPJl/2lai8R5itkL9gRbqiGi1L7rdwsP8Awb
O5d4KUnVMSEFTBDyIBU5w5Di4WJFU04PuchVHDRBiqYNHVEu0y5JmQu0cPpaTd/m
eNuLaymoIduUFLj/aMpda0BTEOwdCJ+G4P5IOwAXkGQ4JUX3NPp3S/bwmS6HYnct
W3q65mhEIuJb1CK7O1k97L9ArmFQ+p74jELvwfJTaP9FNnee3Rs1hpbQ3AVwtEtq
3w0P2XXEDDVcwNvNh+sLKhp7WYWvQM9NXnWPQFu1FiJqIfUk6/SMdplH0KEAdexb
XvERV5TRWqb/ilQPYYiJVgQpe0evZblvERMS3Ul3hSrsEYcr4MBII+RvMZHss/hQ
2yp5XcQNzP9uceT4hIGAlvTAG4BGaH2tbU4x/T9ae0mx52/8I8RS9gSgPqK2SdSf
tMER
-----END ENCRYPTED PRIVATE KEY-----`;

const HELLO_WORLD_PKCS1_B64 = "2EoJzsG9F9el3Dwxm+7Ua1Ykdpnh9WeS2prrkAYGfnkN9irgRvNIUkOSUJAgy4yQ5RjqAHkKgAdwHvjWqLuLhA==";
const EMPTY_PKCS1_B64 = "rfhNp4omqGuP+7J6Z2MuMeDwBzGcRm9kFIPPAn/S6HPXfXN/4Kasd1FUdr9n0+7egspZNSPg5TWq4GKGXuhBhA==";

TestRegister.addTests([
    {
        name: "RSA Encrypt Private Key: missing key",
        input: "Hello World",
        expectedOutput: "Please enter a private key.",
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: ["", "", "PKCS1 v1.5"]
            }
        ]
    },
    {
        name: "RSA Encrypt Private Key: PKCS#1 key, Hello World",
        input: "Hello World",
        expectedOutput: HELLO_WORLD_PKCS1_B64,
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS1, "", "PKCS1 v1.5"]
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="]
            }
        ]
    },
    {
        name: "RSA Encrypt Private Key: PKCS#8 key, Hello World",
        input: "Hello World",
        expectedOutput: HELLO_WORLD_PKCS1_B64,
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS8, "", "PKCS1 v1.5"]
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="]
            }
        ]
    },
    {
        name: "RSA Encrypt Private Key: encrypted PKCS#8 key with password, Hello World",
        input: "Hello World",
        expectedOutput: HELLO_WORLD_PKCS1_B64,
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS8_ENC, "testpassword", "PKCS1 v1.5"]
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="]
            }
        ]
    },
    {
        name: "RSA Encrypt Private Key: empty input",
        input: "",
        expectedOutput: EMPTY_PKCS1_B64,
        recipeConfig: [
            {
                op: "RSA Encrypt Private Key",
                args: [PRIV_512_PKCS1, "", "PKCS1 v1.5"]
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="]
            }
        ]
    }
]);
