/**
 * Post-quantum cryptography operation tests.
 *
 * @author ResonanceCache
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";
import fs from "fs";

const ML_KEM_512_CERT = `-----BEGIN CERTIFICATE-----
MIIFRzCCBC+gAwIBAgIUJ4NW/CmivxweqLGj4yhkQosyMSQwDQYJKoZIhvcNAQEL
BQAwKzEXMBUGA1UECgwOQ3liZXJDaGVmIFRlc3QxEDAOBgNVBAMMB1Rlc3QgQ0Ew
HhcNMjYwOTAxMTg0OTQzWhcNMzYwODI5MTg0OTQzWjArMRcwFQYDVQQKDA5DeWJl
ckNoZWYgVGVzdDEQMA4GA1UEAwwHVGVzdCBDQTCCAzIwCwYJYIZIAWUDBAQBA4ID
IQB5qz8O0lyP2U6Fow3auh7pkHKbqEkvF3TqonvTxzTT90bH+EWTF0K4RUMcxonZ
KCAUks6sUXBB+EmPEQppIqw4Roo9NSsQQQYVSX4scZbr8jgG5q/g3A6MgwrB/L8B
ERG7ewIvJylG2FwDOs8vkh8v56kxwUnVaYtgQloosowy66W7SldEEC95Iif4Y1eo
ujJamjeJApMeppipNAj+UzQ+GrPCOH31mC3xSSrSSETbMwW6hJ6jhJlNtV5GUx8D
+c870QOc48tSTB1is8B9eSCYxzgZdTTYIBQ347HcxJMyRTMrKxgXI5LSEgzyXDLW
AwxPp3pwA30aV6ZqY0gjBm6EMM0tCjWyKooTp1nKQ6C7hBMJl8Axy7s0VLZpFFiu
iIAekIdBGsguNzeEKIn/mwOiqSwMdsrCEM8LYlBO8EJ91rYRXE8KCYl5RqSXMaId
ZDL4CFdAVIuhwQeLwavIaJBnJIXIW4zJyKBugYfhJGh6ZQ8yWyo4wJ8c+suaMoBc
0ZM7C1sIZ8kMEaAZcHZQ2JgZirJ+ET+0oHKsRKck+wmoF1kT95o1qTvY8k0no299
Ewb8B4Ddg2TCYWicsDgclANFdDzcVIeHkYBnlcsmybAoFIR6VCzJiidfV6Yjtrsu
liDZYW7zaSGKE6X0qB1PwTQTAxMSd3FvG5iCkcSrY4SOIi4vJEvsd8ZmkQw1c6qd
MhZ3tsyYqbfrNGicyaZg4zNQbEmBNZaRZhoqMlQTciIX1ZYOSUx2BZPAQ6oRkSZo
hJkwV0+ttl5tVV//EQzIcL1Zoccx8H5oxkprJI1eoYBCQF1HM094cZuNU4CJ8n2G
OW88hcS1JgpkuBCP977ykyXe4IZolorPmKERV6XNgZ88V7sBp4qg5F7oa7ZuQLJL
GrANm2Z+cwTDo3LLwGH9iDU/WGjgoXAqIloNDKpqJyN2eXe8pAy5owSEQzlZWDnG
e4/fbDMXnHyXGktdRcDJAQoZxBXCxjf3DKL7w89/Wq/q0ZjJlCAFMU0zcnl5yAxJ
/ApMjcvTzcHJMqXS71mqprepUZvDSSnUZBAG9pAcEcmRzKNTMFEwHQYDVR0OBBYE
FEirxpN7uxaJNiF4x1Uc2xUcSwYpMB8GA1UdIwQYMBaAFEirxpN7uxaJNiF4x1Uc
2xUcSwYpMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAGAfJu2u
pOuzz25mkjrOwiRX87DQb4w7BxvpJ9eFDnGP6fuf0D5xFD2tdoMTj7n67SLwv9LG
vCFswHOYNMSO0oPt1Gw2ad+dv5CLBrzT10pQwavqXkbmrMXEgGBOW07cf8X2B1c5
Ut/orkKSh3i01haDHb+vMvI1PMqhZ/QhdHi7w/YtFtGkh5Y+9T9Hbh/q2MbryvFj
nhODNEL9iM8iLTZmFqc4d0YBKC9U8kEG0POVjH+5RfuWO7a6YzGcCKOWE/S4DxA1
YYom+1TQ99ncv4p3bXtT07atQZx2dNz3G+j6Mk8nWztGLFEz3f4DiMyiahlXQ6w9
yUxQvL11xbs7SKA=
-----END CERTIFICATE-----`;

const ML_DSA_44_CERT = fs.readFileSync(
    new URL("../../samples/files/mldsa44.crt", import.meta.url),
    "utf8"
);

const ML_DSA_44_PUBLIC_KEY = fs.readFileSync(
    new URL("../../samples/files/mldsa44.pub", import.meta.url),
    "utf8"
);

TestRegister.addTests([
    {
        name: "Parse X.509 certificate: ML-KEM-512",
        input: ML_KEM_512_CERT,
        expectedMatch: /Algorithm:\s+ML-KEM-512[\s\S]*OID:\s+2\.16\.840\.1\.101\.3\.4\.4\.1[\s\S]*Length:\s+6400 bits[\s\S]*basicConstraints CRITICAL:\n\s{4}cA=true/,
        recipeConfig: [
            {
                op: "Parse X.509 certificate",
                args: ["PEM"],
            }
        ],
    },
    {
        name: "Public Key from Certificate: ML-KEM-512",
        input: ML_KEM_512_CERT,
        expectedMatch: /^-----BEGIN PUBLIC KEY-----\r\nMIIDMjALBglghkgBZQMEBAEDggMh/,
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    },
    {
        name: "Parse X.509 certificate: ML-DSA-44",
        input: ML_DSA_44_CERT,
        expectedMatch: /Algorithm:\s+ML-DSA-44[\s\S]*Certificate Signature\n\s{2}Algorithm:\s+ML-DSA-44/,
        recipeConfig: [
            {
                op: "Parse X.509 certificate",
                args: ["PEM"],
            }
        ],
    },
    {
        name: "Public Key from Certificate: ML-DSA-44",
        input: ML_DSA_44_CERT,
        expectedOutput: ML_DSA_44_PUBLIC_KEY.replace(/\r/g, "").replace(/\n/g, "\r\n"),
        recipeConfig: [
            {
                op: "Public Key from Certificate",
                args: [],
            }
        ],
    }
]);
