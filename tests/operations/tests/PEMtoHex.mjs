/**
 * Test PEMtoHex with different inputs
 *
 * @author cplussharp
 *
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

/** RSA 2048bit key pair as PKCS1 and PKCS8 and as certificate */
const PEMS_RSA_PRIVATE_KEY_PKCS1 = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA5WykLKHiBAhmZh5WhocgpQQqZjdrApuRxRT21SJZx6Ce+Oz2
V17/heozu5LEz63jCxW1NrBckzl/Ys8p9LeqYTu6x/LbKloTjfEWxlzXnzUSqn9J
HIxmmJQzjXp9X1D99Tj+NWpRGEIiCFE7JfDhe2KnMGVDDg6kfCLokDdLo256LeQ4
CEkViwY6d+at4xDlIHwvZZmG4Smk56eHhvQE3I8sSAzgoLMBamQ5m3MbiULAYtxs
kCpCfjFxrL6Ziaaj7HZoneF40R30KCI9ygF8vkzxLwe3t5Y4XgHL9TYQm1+BDnin
upIB/zTeO1ygBGA66m6zpmkmuG7d8HXIducz+wIDAQABAoIBACQu3jWr0lmQeZXh
cwQEi8F6xrUYSGhA4NyUUdmLcV1ql6fqt29QLDySk1Yh76hRZF17LvlRF0ig6NZM
lfFihhyPrwWZ57bmPe9E9rKSMe+KD0eUi5NVEVk/BmJpzxwZSfRC6NTDz8Zjp7po
FUwGkYlEJdocHlc5N/fcCZG1Jti/Z1AsZIjO6r6S0O7neC7icECBKHUyWa8/yE1N
++TVyMV+z53Ad1PC+SHMGDlbqJAM3o4wAzD/FAIzyVo6GSnnC+bFdgMtIwtwgYTH
rbr8M8j5fqAHTqNJeblqt/5KHEj2VVsIsHIuQ6lv4llESEqmH+N5KE4O33U7/Wmj
y/+VGAECgYEA9ysROHXOx1ofh3tI/r2C2FUan6/AAe4dc+8E4jMGI5T4xeqYHTRV
l1yS+ZKIxqclIoAmd6SJ7Nx2GdQ55MmokZdZRqsFN1flFOZw2kFH/I0zQZXdOjF+
sf5Lu0FfcTw3VJhJ/YU3CVdlgdP4ekHbaJVFW5i/pTUf5vNs6AGBGxsCgYEA7Z9D
0qnF6GhxA8lJfwnyuktYnwIQoXE6Xp26/NZD7t7HzxHDf43LQxmTk+mDP/yIQHwb
xIx2NE/ncNxlUMl/g1PkJbKVkB8tdIZrLyiT4lebeqgT72Q07IsxRl/GHOr7CfN0
61OBRCe44IlOtaNAZk4zWwuAwAYx+G8ifuOJ+KECgYBP5NvsJChyx+7pHDC8JwXk
Z53zgBvQg+eBUgGCHHwfhEflsa75wbDo/EOF6JfNnrmiLUpB4i2zIpAKSU9tZMHY
TdPNw/orqX2jA9n2sqNSP1ISIR8hcF5Dqq9QGBGByLUZ4yAHksf3fQiSrrHi0ubZ
J2cD9Jv+Cu4E+Sp61AGngQKBgHmuTPTbq1TP5s+hi9laJsnvO3pxfEKv0MwSyWYf
8rmnq3oGBq6S1buOpVvhAC0MDFm5NB76Lq2rHUFWGyu7g2ik1PfY823SCVzaWJjV
lqUZZ6zv1QWJsvBOdvUqpjC4w8TcvsqjAFb+YFXa+ktZRekdsn607UFn6r7laizA
KC8BAoGAZty7sIGMt1gDaoIjySgOox8x7AlY3QUyNQC5N8KW3MZ8KLC5UBtjhqLy
wYOJr+/1R/7ibiHrKkIE/dmg5QN1iS5tZmFvyLwJ+nHQZObFrlcKtpr+1lekQY/m
ly6YJFk3yj2nhYzt8eVXBX2lCoLG1gsrbpXvUfIGJ53L9m1mVAo=
-----END RSA PRIVATE KEY-----`;

const PEMS_RSA_PRIVATE_KEY_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDlbKQsoeIECGZm
HlaGhyClBCpmN2sCm5HFFPbVIlnHoJ747PZXXv+F6jO7ksTPreMLFbU2sFyTOX9i
zyn0t6phO7rH8tsqWhON8RbGXNefNRKqf0kcjGaYlDONen1fUP31OP41alEYQiII
UTsl8OF7YqcwZUMODqR8IuiQN0ujbnot5DgISRWLBjp35q3jEOUgfC9lmYbhKaTn
p4eG9ATcjyxIDOCgswFqZDmbcxuJQsBi3GyQKkJ+MXGsvpmJpqPsdmid4XjRHfQo
Ij3KAXy+TPEvB7e3ljheAcv1NhCbX4EOeKe6kgH/NN47XKAEYDrqbrOmaSa4bt3w
dch25zP7AgMBAAECggEAJC7eNavSWZB5leFzBASLwXrGtRhIaEDg3JRR2YtxXWqX
p+q3b1AsPJKTViHvqFFkXXsu+VEXSKDo1kyV8WKGHI+vBZnntuY970T2spIx74oP
R5SLk1URWT8GYmnPHBlJ9ELo1MPPxmOnumgVTAaRiUQl2hweVzk399wJkbUm2L9n
UCxkiM7qvpLQ7ud4LuJwQIEodTJZrz/ITU375NXIxX7PncB3U8L5IcwYOVuokAze
jjADMP8UAjPJWjoZKecL5sV2Ay0jC3CBhMetuvwzyPl+oAdOo0l5uWq3/kocSPZV
Wwiwci5DqW/iWURISqYf43koTg7fdTv9aaPL/5UYAQKBgQD3KxE4dc7HWh+He0j+
vYLYVRqfr8AB7h1z7wTiMwYjlPjF6pgdNFWXXJL5kojGpyUigCZ3pIns3HYZ1Dnk
yaiRl1lGqwU3V+UU5nDaQUf8jTNBld06MX6x/ku7QV9xPDdUmEn9hTcJV2WB0/h6
QdtolUVbmL+lNR/m82zoAYEbGwKBgQDtn0PSqcXoaHEDyUl/CfK6S1ifAhChcTpe
nbr81kPu3sfPEcN/jctDGZOT6YM//IhAfBvEjHY0T+dw3GVQyX+DU+QlspWQHy10
hmsvKJPiV5t6qBPvZDTsizFGX8Yc6vsJ83TrU4FEJ7jgiU61o0BmTjNbC4DABjH4
byJ+44n4oQKBgE/k2+wkKHLH7ukcMLwnBeRnnfOAG9CD54FSAYIcfB+ER+WxrvnB
sOj8Q4Xol82euaItSkHiLbMikApJT21kwdhN083D+iupfaMD2fayo1I/UhIhHyFw
XkOqr1AYEYHItRnjIAeSx/d9CJKuseLS5tknZwP0m/4K7gT5KnrUAaeBAoGAea5M
9NurVM/mz6GL2Vomye87enF8Qq/QzBLJZh/yuaeregYGrpLVu46lW+EALQwMWbk0
HvourasdQVYbK7uDaKTU99jzbdIJXNpYmNWWpRlnrO/VBYmy8E529SqmMLjDxNy+
yqMAVv5gVdr6S1lF6R2yfrTtQWfqvuVqLMAoLwECgYBm3LuwgYy3WANqgiPJKA6j
HzHsCVjdBTI1ALk3wpbcxnwosLlQG2OGovLBg4mv7/VH/uJuIesqQgT92aDlA3WJ
Lm1mYW/IvAn6cdBk5sWuVwq2mv7WV6RBj+aXLpgkWTfKPaeFjO3x5VcFfaUKgsbW
Cytule9R8gYnncv2bWZUCg==
-----END PRIVATE KEY-----`;

const PEMS_RSA_PUBLIC_KEY_PKCS1 = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5WykLKHiBAhmZh5WhocgpQQqZjdrApuRxRT21SJZx6Ce+Oz2V17/
heozu5LEz63jCxW1NrBckzl/Ys8p9LeqYTu6x/LbKloTjfEWxlzXnzUSqn9JHIxm
mJQzjXp9X1D99Tj+NWpRGEIiCFE7JfDhe2KnMGVDDg6kfCLokDdLo256LeQ4CEkV
iwY6d+at4xDlIHwvZZmG4Smk56eHhvQE3I8sSAzgoLMBamQ5m3MbiULAYtxskCpC
fjFxrL6Ziaaj7HZoneF40R30KCI9ygF8vkzxLwe3t5Y4XgHL9TYQm1+BDninupIB
/zTeO1ygBGA66m6zpmkmuG7d8HXIducz+wIDAQAB
-----END RSA PUBLIC KEY-----`;

const PEMS_RSA_PUBLIC_KEY_PKCS8 = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5WykLKHiBAhmZh5Whocg
pQQqZjdrApuRxRT21SJZx6Ce+Oz2V17/heozu5LEz63jCxW1NrBckzl/Ys8p9Leq
YTu6x/LbKloTjfEWxlzXnzUSqn9JHIxmmJQzjXp9X1D99Tj+NWpRGEIiCFE7JfDh
e2KnMGVDDg6kfCLokDdLo256LeQ4CEkViwY6d+at4xDlIHwvZZmG4Smk56eHhvQE
3I8sSAzgoLMBamQ5m3MbiULAYtxskCpCfjFxrL6Ziaaj7HZoneF40R30KCI9ygF8
vkzxLwe3t5Y4XgHL9TYQm1+BDninupIB/zTeO1ygBGA66m6zpmkmuG7d8HXIducz
+wIDAQAB
-----END PUBLIC KEY-----`;

const PEMS_RSA_CERT = `-----BEGIN CERTIFICATE-----
MIIDGzCCAgOgAwIBAgIUROs52CB3BsvEVLOCtALalnJG8tEwDQYJKoZIhvcNAQEL
BQAwHTEbMBkGA1UEAwwSUlNBIDIwNDggUHVibGljS2V5MB4XDTIxMDQxMzIxMDE0
OVoXDTMxMDQxMTIxMDE0OVowHTEbMBkGA1UEAwwSUlNBIDIwNDggUHVibGljS2V5
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5WykLKHiBAhmZh5Whocg
pQQqZjdrApuRxRT21SJZx6Ce+Oz2V17/heozu5LEz63jCxW1NrBckzl/Ys8p9Leq
YTu6x/LbKloTjfEWxlzXnzUSqn9JHIxmmJQzjXp9X1D99Tj+NWpRGEIiCFE7JfDh
e2KnMGVDDg6kfCLokDdLo256LeQ4CEkViwY6d+at4xDlIHwvZZmG4Smk56eHhvQE
3I8sSAzgoLMBamQ5m3MbiULAYtxskCpCfjFxrL6Ziaaj7HZoneF40R30KCI9ygF8
vkzxLwe3t5Y4XgHL9TYQm1+BDninupIB/zTeO1ygBGA66m6zpmkmuG7d8HXIducz
+wIDAQABo1MwUTAdBgNVHQ4EFgQUcRhRB6H5JqlDHbymwqydW2/EAt8wHwYDVR0j
BBgwFoAUcRhRB6H5JqlDHbymwqydW2/EAt8wDwYDVR0TAQH/BAUwAwEB/zANBgkq
hkiG9w0BAQsFAAOCAQEALXBmDizTp/Uz4M2A4nCl0AVclrXEk+YjAKqZnvtj44Gs
CUcpxtcXu64ppsSYCwawvzIm6B2Mdmib422aInH0e0oNrn8cRzC144Hjnzxguamj
LyZXnH/0wN9SAjqCKt++urH9wbRMIl0v+g4CWjGyY+eYkMmd1UMQvdCCCv6RVm56
7dBCijJIHg23JbgPJD72JCluXtTYWllv3duSwuWeYHo5EftU456pDcztkgn9XwFk
PFGnHLmbjpSzjE7u29qCjwHl3CiUsjfUlYFl/mf27oDXPqaWqPYv3fWH3H3ymiZQ
cqptUF4hDtPkaNkKWFmlljChN92o8g/jrv4DVDgJzQ==
-----END CERTIFICATE-----`;

/** EC P-256 key pair and certificate */
const PEMS_EC_P256_PRIVATE_KEY = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIIhdQxQIcMnCHD3X4WqNv+VgycWmFoEZpRl9X0+dT9uHoAoGCCqGSM49
AwEHoUQDQgAEFLQcBbzDweo6af4k3k0gKWMNWOZVn8+9hH2rv4DKKYZ7E1z64LBt
PnB1gMz++HDKySr2ozD3/46dIbQMXUZKpw==
-----END EC PRIVATE KEY-----`;

const PEMS_EC_P256_PRIVATE_KEY_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiF1DFAhwycIcPdfh
ao2/5WDJxaYWgRmlGX1fT51P24ehRANCAAQUtBwFvMPB6jpp/iTeTSApYw1Y5lWf
z72Efau/gMophnsTXPrgsG0+cHWAzP74cMrJKvajMPf/jp0htAxdRkqn
-----END PRIVATE KEY-----`;

const PEMS_EC_P256_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFLQcBbzDweo6af4k3k0gKWMNWOZV
n8+9hH2rv4DKKYZ7E1z64LBtPnB1gMz++HDKySr2ozD3/46dIbQMXUZKpw==
-----END PUBLIC KEY-----`;

const PEMS_FOO = `-----BEGIN FOO-----
Rk9P
-----END FOO-----`;
const PEMS_BAR = `-----BEGIN BAR-----
QkFS
-----END BAR-----`;

TestRegister.addTests([
    {
        name: "PEMtoHex: Nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: No footer",
        input: PEMS_RSA_PRIVATE_KEY_PKCS1.substring(0, 200),
        expectedOutput: "PEM footer '-----END RSA PRIVATE KEY-----' not found",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: Multiple PEMs",
        input: PEMS_FOO + "\n" + PEMS_BAR,
        expectedOutput: "FOOBAR",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "From Hex",
                "args": ["Auto"]
            }
        ]
    },
    {
        name: "PEMtoHex: Single line PEM",
        input: PEMS_FOO.replace(/(\n|\r)/gm, ""),
        expectedOutput: "FOO",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "From Hex",
                "args": ["None"]
            }
        ]
    },
    {
        name: "PEMtoHex: EC P-256 Private Key",
        input: PEMS_EC_P256_PRIVATE_KEY,
        expectedOutput: "30770201010420885d43140870c9c21c3dd7e16a8dbfe560c9c5a6168119a5197d5f4f9d4fdb87a00a06082a8648ce3d030107a1440342000414b41c05bcc3c1ea3a69fe24de4d2029630d58e6559fcfbd847dabbf80ca29867b135cfae0b06d3e707580ccfef870cac92af6a330f7ff8e9d21b40c5d464aa7",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: EC P-256 Private Key PKCS8",
        input: PEMS_EC_P256_PRIVATE_KEY_PKCS8,
        expectedOutput: "308187020100301306072a8648ce3d020106082a8648ce3d030107046d306b0201010420885d43140870c9c21c3dd7e16a8dbfe560c9c5a6168119a5197d5f4f9d4fdb87a1440342000414b41c05bcc3c1ea3a69fe24de4d2029630d58e6559fcfbd847dabbf80ca29867b135cfae0b06d3e707580ccfef870cac92af6a330f7ff8e9d21b40c5d464aa7",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: EC P-256 Public Key",
        input: PEMS_EC_P256_PUBLIC_KEY,
        expectedOutput: "3059301306072a8648ce3d020106082a8648ce3d0301070342000414b41c05bcc3c1ea3a69fe24de4d2029630d58e6559fcfbd847dabbf80ca29867b135cfae0b06d3e707580ccfef870cac92af6a330f7ff8e9d21b40c5d464aa7",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: RSA Private Key PKCS1",
        input: PEMS_RSA_PRIVATE_KEY_PKCS1,
        expectedOutput: "fb49bd96ffc5d1351a35d773921fac03",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "MD5",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: RSA Private Key PKCS8",
        input: PEMS_RSA_PRIVATE_KEY_PKCS8,
        expectedOutput: "23086d03633689fee64680c3c24409eb",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "MD5",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: RSA Public Key PKCS1",
        input: PEMS_RSA_PUBLIC_KEY_PKCS1,
        expectedOutput: "5fc3f1f6c5d5806760b12eaad0c0292c",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "MD5",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: RSA Public Key PKCS8",
        input: PEMS_RSA_PUBLIC_KEY_PKCS8,
        expectedOutput: "30fbe8e9495d591232affebdd6206ea6",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "MD5",
                "args": []
            }
        ]
    },
    {
        name: "PEMtoHex: Certificate",
        input: PEMS_RSA_CERT,
        expectedOutput: "6694d8ca4a0ceb84c3951d25dc05ec6e",
        recipeConfig: [
            {
                "op": "PEM to Hex",
                "args": []
            },
            {
                "op": "MD5",
                "args": []
            }
        ]
    }
]);
