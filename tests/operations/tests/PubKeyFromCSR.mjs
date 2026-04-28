import TestRegister from "../../lib/TestRegister.mjs";

const RSA_2048_CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIICyzCCAbMCAQAwTzELMAkGA1UEBhMCTkExCzAJBgNVBAgMAm5hMQswCQYDVQQH
DAJuYTESMBAGA1UECgwJY3liZXJjaGVmMRIwEAYDVQQDDAlnaXRodWIuaW8wggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCSFAA8f3IrypTeFiLyGIk/JyYG
VxSfyouNIppgV3QaUr3SuUyCIa8U5BVgzrrLc9NeeYaKXI5TFOq3IrhjLZqrKvcZ
jo6uxLwjwSC8qI5V3f147qF6E8/P18IaZtJn0XJHEWY8zZ1u9wMHURB4iC6juszg
4UhYwAgqKWzRl9ON8aqpXSxp01eUtVX+Ve4+GixKWCZfxMjLWZ8T1rzYUfC/W0wl
1PFJPVGBQKBeBTQaKERgLIjNX5Qk/GvFwt3bUBd34GgH/CybhagP3GBQF/+ZJ7Fc
Wu4N4tF7Gxn6IavjPEIJ86DexgrR9WugzcqBwmdNMA6bK9A4XagekY9ao4RFAgMB
AAGgNzA1BgkqhkiG9w0BCQ4xKDAmMCQGA1UdEQQdMBuCCWdpdGh1Yi5pb4IOZ2No
cS5naXRodWIuaW8wDQYJKoZIhvcNAQELBQADggEBADe+eaTZBg+JOcMYecO+Mf5e
4DbJd1r4bg39UMfRBa3hEq2EZZk2IfLfmU2YDGvzt/ZUQF4QFnW0ih4bBLkXuSxw
alA3BzMeB9Br/j5fAAo+4xm6F4qquzozznFWNMqsnuv4j9NdAU5WqqEkWnVTfQqh
myh7wbLev8yPjAL+WSKoN45MuOlOrLBJp+lr3LlEWconRAfHpHPPhYcLbieaUZgx
/YJEHm4iiaJpPxBOxXAenVovncTCH6XRZsdsria8wuyTZH4hlg3so7gc8C6nmHvl
ia/tkQICn+jPRTFtN1Bkn+SdUKVx1W5HTKy4yTE3Km1yh0nPUS5MGBBFgWnKANo=
-----END CERTIFICATE REQUEST-----`;

const RSA_2048_CSR_PUB_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhQAPH9yK8qU3hYi8hiJ
PycmBlcUn8qLjSKaYFd0GlK90rlMgiGvFOQVYM66y3PTXnmGilyOUxTqtyK4Yy2a
qyr3GY6OrsS8I8EgvKiOVd39eO6hehPPz9fCGmbSZ9FyRxFmPM2dbvcDB1EQeIgu
o7rM4OFIWMAIKils0ZfTjfGqqV0sadNXlLVV/lXuPhosSlgmX8TIy1mfE9a82FHw
v1tMJdTxST1RgUCgXgU0GihEYCyIzV+UJPxrxcLd21AXd+BoB/wsm4WoD9xgUBf/
mSexXFruDeLRexsZ+iGr4zxCCfOg3sYK0fVroM3KgcJnTTAOmyvQOF2oHpGPWqOE
RQIDAQAB
-----END PUBLIC KEY-----`;

/* RSA 2048 Private Key
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSFAA8f3IrypTe
FiLyGIk/JyYGVxSfyouNIppgV3QaUr3SuUyCIa8U5BVgzrrLc9NeeYaKXI5TFOq3
IrhjLZqrKvcZjo6uxLwjwSC8qI5V3f147qF6E8/P18IaZtJn0XJHEWY8zZ1u9wMH
URB4iC6juszg4UhYwAgqKWzRl9ON8aqpXSxp01eUtVX+Ve4+GixKWCZfxMjLWZ8T
1rzYUfC/W0wl1PFJPVGBQKBeBTQaKERgLIjNX5Qk/GvFwt3bUBd34GgH/CybhagP
3GBQF/+ZJ7FcWu4N4tF7Gxn6IavjPEIJ86DexgrR9WugzcqBwmdNMA6bK9A4Xage
kY9ao4RFAgMBAAECggEAA96TwwZ9N7u+BcQAWPldaVbYIwLbgQAUgkCQZkzqvmfC
r3pJFIlf4eXIyy+uswT2bGI7th6NhpXfQcqhp77lgfM5aGvmS6racPgErfqpCo0+
0Z1AmcM8lfzZH2np2OYraMaFNscbjHzuj5sOHKM+2QdxteNBz1gG31cJkuO6rt/V
qr3Fy4twJ+htTTbmX4ArVpUaY5F+eZu2qw4kOVDrNnPpz6LKx5UVBFszvW8/8trr
B03ppkloJUUda5aKkKKiyYpC/xOoCBSc9mbQtptiWo/8tMm7E/AfNy1oUeNp3+M/
+vO7sj5dA2Xr1g/76j/tp43cxvzv89dYdmq/sf6MYQKBgQDMXD9mfQf8FJqL09HH
le6N2xD0K8V2RCbdp5YOPZY6jkw3howddvSzcpQI3qsjGLLc7CrdhfsuheSebPhe
D5SKYejtPNNIcSA8xitjZPtzsi3ELhOyVkUeHaIa7itq35jnSOnc8haZMhhuzkWS
68iHk9ijBwOKvK1fTfXK232LMwKBgQC2/ZFOlCIce0y/5XkBJEGdcGSLw1ncGSlG
6cYY3AoV14dfmeMD1wXf6OQGTC7Nc3gTXXP2KXLI6dHNPkC+cU6DCD7GGThb8kOk
plUZnKVAs+copHspL3nYCjXTgDQ5cvTGX8DSYSyap7BFYLcdTXI4R5HEhb9uqJ8i
NsVWFTtypwKBgQCJus47+55LBXPXM04aDnF1h6QYe/ucJnhvQMhAFr/N/SNe9L4w
CYEIA/vDMpbyk23QuRZ2sBrGkxSutVB6zFNXJH/AjBL1qtCIRSLu3RsfMYHoywkZ
U01H677aGZSHdeTuU9TRxRL38qxG2ZxIVcKTpVAHJ+36LglGxxsVufIVwwKBgBsP
zNluFs1XfrYyXX7JudpqsLPqo/Nk1THjiKRMhkFMqnx86ZG7zuaaLn6v7Yv8s5lJ
jMiuwIbt7VUJC9IeN5oxMfdh62/NmCtVXeh3vgifkmP0TzJ8DuzgNa2dnBuS4Jgl
uQJj1JDak7ru3qW6ulWQYAJMNU9MKJyKtQxR/4SpAoGAOHsyTmptmLO85l39dTBV
RJsYfp24fp/qM9QiB9y4VOauuokqrxHijEi5ZhPIIgsyuk45b31lGARj+SXBdWOf
oKSfwh7rHd7vFqKumRiZydfszbXxtHvLDFi0oukYDI16afOb3y5tmuSdyv8Y6ZsT
H2zqBm8koIaSdtBUYfsJM08=
-----END PRIVATE KEY-----
*/

// -------------------------------------------------------------

const EC_PUB_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEtV2tWhuWHVvaZGpAfdbz6XK7YS8b
qUx6D7VWiQkYidpzXWCTlnprARCO/2OK5t3EhUwZyPZueFr7lgIAFRFDkw==
-----END PUBLIC KEY-----`;

const EC_CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIIBADCBpwIBADBFMQswCQYDVQQGEwJOQTETMBEGA1UECAwKU29tZS1TdGF0ZTEh
MB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMFkwEwYHKoZIzj0CAQYI
KoZIzj0DAQcDQgAEtV2tWhuWHVvaZGpAfdbz6XK7YS8bqUx6D7VWiQkYidpzXWCT
lnprARCO/2OK5t3EhUwZyPZueFr7lgIAFRFDk6AAMAoGCCqGSM49BAMCA0gAMEUC
IQCEswjMY+jmBXtUogwoZ9GjOb9g72ZAiiL3fbUIKKOuigIgK10fc/M2QSgfv9x6
r18dKfOku2+q1Sa9M08iee6hGUI=
-----END CERTIFICATE REQUEST-----`;

/* EC Private Key
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIA42NtMH8T9dPpbKlptxNcUmAIcv112fwJkn9XRYxbdMoAoGCCqGSM49
AwEHoUQDQgAEtV2tWhuWHVvaZGpAfdbz6XK7YS8bqUx6D7VWiQkYidpzXWCTlnpr
ARCO/2OK5t3EhUwZyPZueFr7lgIAFRFDkw==
-----END EC PRIVATE KEY-----
*/

TestRegister.addTests([

    {
        name: "Public Key from CSR: RSA 2048 returns correct public key",
        input: RSA_2048_CSR,
        expectedOutput: RSA_2048_CSR_PUB_KEY,
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: two CSRs returns public key twice",
        input: `${RSA_2048_CSR}\n${RSA_2048_CSR}`,
        expectedOutput: RSA_2048_CSR_PUB_KEY + RSA_2048_CSR_PUB_KEY,
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: missing footer throws",
        input: RSA_2048_CSR.substring(0, RSA_2048_CSR.lastIndexOf("-----END")),
        expectedOutput: "CSR footer '-----END CERTIFICATE REQUEST-----' not found",
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: empty input returns empty output",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: no PEM block returns empty output",
        input: "this is not a CSR",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: wrong PEM type is ignored",
        input: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA
-----END PRIVATE KEY-----`,
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
    {
        name: "Public Key from CSR: EC P-256 returns correct public key",
        input: EC_CSR,
        expectedOutput: EC_PUB_KEY,
        recipeConfig: [
            {
                op: "Public Key from CSR",
                args: [],
            }
        ],
    },
]);
