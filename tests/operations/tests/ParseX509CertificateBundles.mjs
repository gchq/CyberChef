/**
 * Parse X.509 certificate bundles tests
 *
 * @author Pål Sollie [sollie@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";
import ParseX509Certificate from "../../../src/core/operations/ParseX509Certificate.mjs";

const RSA_CERT = `-----BEGIN CERTIFICATE-----
MIIBfTCCASegAwIBAgIUeisK5Nwss2DGg5PCs4uSxxXyyNkwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIUlNBIHRlc3QwHhcNMjExMTE5MTcyMDI2WhcNMzExMTE3
MTcyMDI2WjATMREwDwYDVQQDDAhSU0EgdGVzdDBcMA0GCSqGSIb3DQEBAQUAA0sA
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAGjUzBRMB0GA1UdDgQWBBRO+jvkqq5p
pnQgwMMnRoun6e7eiTAfBgNVHSMEGDAWgBRO+jvkqq5ppnQgwMMnRoun6e7eiTAP
BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA0EAR/5HAZM5qBhU/ezDUIFx
gmUGoFbIb5kJD41YCnaSdrgWglh4He4melSs42G/oxBBjuCJ0bUpqWnLl+lJkv1z
IA==
-----END CERTIFICATE-----`;

const EC_CERT = `-----BEGIN CERTIFICATE-----
MIIBfzCCASWgAwIBAgIUK4H8J3Hr7NpRLPrACj8Pje4JJJ0wCgYIKoZIzj0EAwIw
FTETMBEGA1UEAwwKUC0yNTYgdGVzdDAeFw0yMTExMTkxNzE5NDVaFw0zMTExMTcx
NzE5NDVaMBUxEzARBgNVBAMMClAtMjU2IHRlc3QwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAAQNRzwDQQM0qgJgg9YwfPXJTOoTmYmC6yBwATwfrzXR+QnxmZM2IIJr
qwuBHa8PVU2HZ2KKtaAo8fg9Uwpq/l7po1MwUTAdBgNVHQ4EFgQU/SxodXrpkybM
gcIgkxnRKd7HMzowHwYDVR0jBBgwFoAU/SxodXrpkybMgcIgkxnRKd7HMzowDwYD
VR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiBU9PrOa/kXCpTTBInRf/sN
ac2iDHmbdpWzcXI+xLKNYAIhAIRR1LRSHVwOTLQ/iBXd+8LCkm5aTB27RW46LN80
ylxt
-----END CERTIFICATE-----`;

const parser = new ParseX509Certificate();
const recipeConfig = [{op: "Parse X.509 certificate bundles", args: []}];

TestRegister.addTests([
    {
        name: "Parse X.509 certificate bundles: single PEM",
        input: RSA_CERT,
        expectedOutput: `Certificate 1:\n${parser.run(RSA_CERT, ["PEM"])}`,
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: ordered PEM file with CRLF",
        input: `\r\n${RSA_CERT}\r\n\r\n${EC_CERT}\r\n`.replace(/(?<!\r)\n/g, "\r\n"),
        expectedOutput: `Certificate 1:\n${parser.run(RSA_CERT, ["PEM"])}\n\nCertificate 2:\n${parser.run(EC_CERT, ["PEM"])}`,
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: empty input",
        input: "",
        expectedOutput: "No input",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: missing footer",
        input: RSA_CERT.replace("-----END CERTIFICATE-----", ""),
        expectedOutput: "Certificate 1: PEM footer not found",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: invalid second certificate",
        input: `${RSA_CERT}\n-----BEGIN CERTIFICATE-----\ninvalid\n-----END CERTIFICATE-----`,
        expectedOutput: "Certificate 2: Certificate load error (non-certificate input?)",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: nested certificate header",
        input: `${RSA_CERT}\n-----BEGIN CERTIFICATE-----\n${EC_CERT}`,
        expectedOutput: "Certificate 2: Certificate load error (non-certificate input?)",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: rejects non-certificate content",
        input: `${RSA_CERT}\nignored data`,
        expectedOutput: "Invalid certificate bundle content",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: rejects no certificates",
        input: "not a PEM bundle",
        expectedOutput: "Invalid certificate bundle content",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: limits certificate count",
        input: Array(101).fill(RSA_CERT).join("\n"),
        expectedOutput: "Certificate bundle exceeds 100 certificates",
        recipeConfig
    },
    {
        name: "Parse X.509 certificate bundles: limits input size",
        input: RSA_CERT + " ".repeat(2_000_000),
        expectedOutput: "Certificate bundle exceeds 2 MB",
        recipeConfig
    }
]);
