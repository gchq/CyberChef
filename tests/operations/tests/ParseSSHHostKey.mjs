/**
 * Parse SSH Host Key tests
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "SSH Host Key: RSA",
        input: "AAAAB3NzaC1yc2EAAAADAQABAAABAQDiJZ/9W9Ix/Dk9b+K4E+RGCug1AtkGXaJ9vNIY0YHFHLpWsB8DAuh/cGEI9TLbL1gzR2wG+RJNQ2EAQVWe6ypkK63Jm4zw4re+vhEiszpnP889J0h5N9yzyTndesrl4d3cQtv861FcKDPxUJbRALdtl6gwOB7BCL8gsXJLLVLO4EesrbPXD454qpVt7CgJXEXByOFjcIm3XwkdOnXMPHHnMSD7EIN1SvQMD6PfIDrbDd6KQt5QXW/Rc/BsfX5cbUIV1QW5A/GbepXHHKmWRtLC2J/mH3hW2Zq/hITPEaJdG1CtIilQmJaZGXpfGIwFeb0Av9pSL926arZZ6vDi9ctF",
        expectedOutput: `Key type: ssh-rsa
Exponent: 0x010001
Modulus: 0x00e2259ffd5bd231fc393d6fe2b813e4460ae83502d9065da27dbcd218d181c51cba56b01f0302e87f706108f532db2f5833476c06f9124d43610041559eeb2a642badc99b8cf0e2b7bebe1122b33a673fcf3d27487937dcb3c939dd7acae5e1dddc42dbfceb515c2833f15096d100b76d97a830381ec108bf20b1724b2d52cee047acadb3d70f8e78aa956dec28095c45c1c8e1637089b75f091d3a75cc3c71e73120fb1083754af40c0fa3df203adb0dde8a42de505d6fd173f06c7d7e5c6d4215d505b903f19b7a95c71ca99646d2c2d89fe61f7856d99abf8484cf11a25d1b50ad222950989699197a5f188c0579bd00bfda522fddba6ab659eaf0e2f5cb45`,
        recipeConfig: [
            {
                op: "Parse SSH Host Key",
                args: ["Base64"],
            },
        ],
    },
    {
        name: "SSH Host Key: DSA",
        input: "AAAAB3NzaC1kc3MAAACBAMnoZCOzvaQqs//9mxK2USZvJBc7b1dFJiBcV80abN6maE+203pTRPIPCpPt0deQxv4YN3dSHoodEcArWxs1QRAIuRsQIvsUP7chovzGnxP84XWK5sbfrseD0vxZ7UR0NaAFPcSgeXcWC1SG9uvrAJQlyp4DBy+fKuqiYmwaz0bHAAAAFQCXNJ4yiE1V7LpCU2V1JKbqDvICMwAAAIB/5aR1iBOeyCVpj0dP3YZmoxd9R7FCC/0UuOf0lx4E6WHT6Z2QuPBhc2mpNDq2M0VF9oJfVWgcfG8r1rlXaCYODSacGcbnW5VKQ+LKkkALmg4h8jFCHReUC+Hmia/v8LyDwPO1wK6ETn7a3m80yM7gAU5ZNurVIVVP2lB65mjEsQAAAIA3ct9YRB6iUCvOD45sZM1C9oTC24Ttmaou0GcpWx3h0/iZ8mbil1cjaO9frRNZ/vSSVWEhEDNG8gwkjZWlvnJL3y1XUxbMll4WbmI/Q1kzKwopceaFwMbYTPKDg6L1RtCMUxSUyKsFk1c4SpEPlDS7DApZs5PgmWgMd/u6vwMXyg==",
        expectedOutput: `Key type: ssh-dss
p: 0x00c9e86423b3bda42ab3fffd9b12b651266f24173b6f574526205c57cd1a6cdea6684fb6d37a5344f20f0a93edd1d790c6fe183777521e8a1d11c02b5b1b35411008b91b1022fb143fb721a2fcc69f13fce1758ae6c6dfaec783d2fc59ed447435a0053dc4a07977160b5486f6ebeb009425ca9e03072f9f2aeaa2626c1acf46c7
q: 0x0097349e32884d55ecba4253657524a6ea0ef20233
g: 0x7fe5a47588139ec825698f474fdd8666a3177d47b1420bfd14b8e7f4971e04e961d3e99d90b8f0617369a9343ab6334545f6825f55681c7c6f2bd6b95768260e0d269c19c6e75b954a43e2ca92400b9a0e21f231421d17940be1e689afeff0bc83c0f3b5c0ae844e7edade6f34c8cee0014e5936ead521554fda507ae668c4b1
y: 0x3772df58441ea2502bce0f8e6c64cd42f684c2db84ed99aa2ed067295b1de1d3f899f266e297572368ef5fad1359fef492556121103346f20c248d95a5be724bdf2d575316cc965e166e623f4359332b0a2971e685c0c6d84cf28383a2f546d08c531494c8ab059357384a910f9434bb0c0a59b393e099680c77fbbabf0317ca`,
        recipeConfig: [
            {
                op: "Parse SSH Host Key",
                args: ["Base64"],
            },
        ],
    },
    {
        name: "SSH Host Key: ECDSA",
        input: "AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBGxZWSAGJyJQoVBwFCpr420eRUZDE/kw2YWm5vDro8050DZ1ZzqIuYaNl0BGzMcRTeasGtJuI8G84ZQQSgca3C4=",
        expectedOutput: `Key type: ecdsa-sha2-nistp256
Curve: nistp256
Point: 0x046c59592006272250a15070142a6be36d1e45464313f930d985a6e6f0eba3cd39d03675673a88b9868d974046ccc7114de6ac1ad26e23c1bce194104a071adc2e`,
        recipeConfig: [
            {
                op: "Parse SSH Host Key",
                args: ["Base64"],
            },
        ],
    },
    {
        name: "SSH Host Key: Ed25519",
        input: "AAAAC3NzaC1lZDI1NTE5AAAAIBOF6r99IkvqGu1kwZrHHIqjpTB5w79bpv67B/Aw3+WJ",
        expectedOutput: `Key type: ssh-ed25519
x: 0x1385eabf7d224bea1aed64c19ac71c8aa3a53079c3bf5ba6febb07f030dfe589`,
        recipeConfig: [
            {
                op: "Parse SSH Host Key",
                args: ["Base64"],
            },
        ],
    },
    {
        name: "SSH Host Key: Extract key",
        input: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDiJZ/9W9Ix/Dk9b+K4E+RGCug1AtkGXaJ9vNIY0YHFHLpWsB8DAuh/cGEI9TLbL1gzR2wG+RJNQ2EAQVWe6ypkK63Jm4zw4re+vhEiszpnP889J0h5N9yzyTndesrl4d3cQtv861FcKDPxUJbRALdtl6gwOB7BCL8gsXJLLVLO4EesrbPXD454qpVt7CgJXEXByOFjcIm3XwkdOnXMPHHnMSD7EIN1SvQMD6PfIDrbDd6KQt5QXW/Rc/BsfX5cbUIV1QW5A/GbepXHHKmWRtLC2J/mH3hW2Zq/hITPEaJdG1CtIilQmJaZGXpfGIwFeb0Av9pSL926arZZ6vDi9ctF test@test",
        expectedOutput: `Key type: ssh-rsa
Exponent: 0x010001
Modulus: 0x00e2259ffd5bd231fc393d6fe2b813e4460ae83502d9065da27dbcd218d181c51cba56b01f0302e87f706108f532db2f5833476c06f9124d43610041559eeb2a642badc99b8cf0e2b7bebe1122b33a673fcf3d27487937dcb3c939dd7acae5e1dddc42dbfceb515c2833f15096d100b76d97a830381ec108bf20b1724b2d52cee047acadb3d70f8e78aa956dec28095c45c1c8e1637089b75f091d3a75cc3c71e73120fb1083754af40c0fa3df203adb0dde8a42de505d6fd173f06c7d7e5c6d4215d505b903f19b7a95c71ca99646d2c2d89fe61f7856d99abf8484cf11a25d1b50ad222950989699197a5f188c0579bd00bfda522fddba6ab659eaf0e2f5cb45`,
        recipeConfig: [
            {
                op: "Parse SSH Host Key",
                args: ["Base64"],
            },
        ],
    },
]);
