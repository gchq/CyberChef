/**
 * Image operation tests.
 *
 * @author tlwr [toby@toby.codes]
 * @author Ge0rg3 [georgeomnet+cyberchef@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import {
    GIF_ANIMATED_HEX,
    PNG_HEX,
    JPG_B64,
    EXIF_JPG_HEX,
    NO_EXIF_JPG_HEX,
} from "../../samples/Images.mjs";

TestRegister.addTests([
    {
        name: "Render Image: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [{ op: "Render Image", args: ["Raw"] }],
    },
    {
        name: "Render Image: raw gif",
        input: GIF_ANIMATED_HEX,
        expectedOutput:
            "<img src='data:image/gif;base64,R0lGODlhDwAPALMLAEJCQv/nAP/vAP/OAAAAAP+1AP+cAP//lP//EP//xv//7////wAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFMgALACwAAAAADwAPAAAEWnBJCWqdeFWVzhkXBnAIEgTCYAAT0J3oma7UERCEgOIp65o4GU9VOZgESFRyUCjGYjoUs3J86nRTwEBAkHkJRM22q+QOQJQzFxcMp8/wgrsFKNgLK1aGYtFPIgAh+QQFCgALACwDAAkACQABAAAEBTBIMWUEACH5BAUKAAsALAQACgAHAAEAAAQFMKw5QwQAIfkEBQoACwAsBAAEAAcAAQAABAVQBClDBAAh+QQFCgALACwDAAQACQACAAAECjAQIoKYV1xZSQQAIfkEBQoACwAsAwAEAAkAAgAABAkwCEkpIUFeEQEAIfkEBTIACwAsBAAEAAcAAQAABAWQkEVlBAAh+QQFGQALACwDAAQACAACAAAECZCssJYMUtQbAQAh+QQFGQALACwDAAQACQACAAAECTAIQmSgEotJIgAh+QQFCgALACwEAAQACAACAAAECXAFseoksmIRAQAh+QQFCgALACwDAAQACQACAAAECjAQIoKYV1xZSQQAIfkEBQoACwAsAwAEAAkAAgAABAkwCEkpIUFeEQEAIfkEBTIACwAsBAAEAAcAAQAABAWQkEVlBAAh+QQFGQALACwEAAMABwADAAAECpCQRSW9VIgrQgQAIfkEBRkACwAsAwADAAgAAgAABAmQrLCWFJLaGQEAIfkEBRkACwAsAwADAAkAAgAABArwBEJEmCQIqnEEACH5BAUZAAsALAUAAwAHAAMAAAQKMIRFxaCYEoJ3BAAh+QQFHgALACwEAAQACAACAAAECZAssZYUMtQbAQAh+QQFCgALACwEAAoABwABAAAEBZCsOUkEACH5BAUKAAsALAMACQAJAAEAAAQFkKxJF4kAOw=='>",
        recipeConfig: [
            { op: "From Hex", args: ["Space"] },
            { op: "Render Image", args: ["Raw"] },
        ],
    },
    {
        name: "Render Image: hex png",
        input: PNG_HEX,
        expectedOutput:
            "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAFGElEQVRYw8VXXWwUVRT+7szszKzb3bbglqXbzbbQbYDQYJBGbWlTRUq1KtCmVYmECsHQKjE8mJrwYoIPpmIQEw2aaLA2PDRhATVpCxiLcYPBP0RQbIEVulNatt3SYX9mf2auD7QVlt3uLq3xPE3mnnvPd8/5zs8luD9hOzs7l1sslvJQKMR6PJ4fWlpafgWgAWAA0MnvlELSNEimDt65c6dpx44dB3JychplWUYgEGAAUFmWvxofHz9nNpvrwuHw72vXrt0KQJ0tAOJ0Oh8pKSlpFQRhmaZpAQB6o9FYBgATExPaJAAAAKWUEkKIqqq3Kisr7R0dHY+Lojhvw4YNnyXzyEwAiMvlai0sLNxHCNElUogHcKcoijIoCIIVADwez9aNGzd+nkiPS2bd6XSustvtSY2nElEUbVOO0bTkdGCS3d7hcLQwDKPDLCUcDt/YvHnz0WTeTgaAEQRheUoCEZKSxIIgLDh+/PhvPT09exOBSBYCSilV5iqLRFG0q6r62OSF1XQ8oAUCgVNpnE3TDIMUCoV+TJQJyQCgu7v7w2g0OjSjdUppOhxYt27d8tra2l2JACcFsHv37uEzZ848qyhK/2xIKAhCXmdn5wvJ6gAz0+bGxsZf1qxZU6FpWjRTw6FQyE0pVSmlmqZpkUzTcFrcbreSbqynRFXVYFVV1cMDAwP1kiS9Ul9ffzCZLof/QDRNUyilyqZNm75MpcvgfxZmrlItrkCl3Y7TCUHI5XJ9YzQan4pfGBoawvDwcCICngIQnSsAuuLiYgfLsvcs8DyPnJycRBxYDIBNxwszAli2wCC+uHrJq+y1n4sIc3e09PMKaLbeSCVJopIk3bUWi8Uc1dXVT/b19XXPppYz7euXHHji0ZXbBV53z7ai6q24FuW1n/r7GafTCVVV46tkNBqNlvb29v51XyR8adVCq9nAvTxw+QpijDD9X1ZULFxVD8ODdgBAbm4uyp4uQzg3/O/AyLLgef57n8/nq6mpKWYTxS9VCErMhkoCcBOyjIKKLTDoBby+Zw+sS1dA9akoWxjGoNtNqMGA/cb9sDXYUMVVoXSkFIQQuFyucpPJdEKn05U2NDQ0d3V1fZG2B1oqbEXWbOGDaSWGhd5kRlnZavRf+ANF+fkIyTKCExPE7/djm20bBoODWCQsgtlshiiKvlgs5uZ5fgUhhHAcl5eRB5bmGXaxDJkf/397UxO2NzVB1TQEJtNvdHQU5cZylGeVA6HpBjTm9XrbrFbrsUAg8OmhQ4fez4QDjI4jK1O0WIjcbexjY2OJ0pDJyspaPQmmoqampigTAFTTMJKixSJyu+RRWZYRPxYoirLIZDK9AQAcxy21WCyvZRIC6vVHPn6A168nBAnZyzIMDGYzHKWlYCwWJBgNSSQSOSvL8ttGo/E5SZL2ZcSBt3ovn3jnGUdrXhb/LgDTHa6FJMsw6PVgOQ7nLl4kPX19NBaLwWAwqHV1dSzLsgQAotHot0eOHDkM4PD9VEL65tcDnzQ9ZDlWNF9fy/H6/QCyGYaBRa/HjUuXEBobgzoyQm02G83Pz4fNZmOnpmSe5wclSXpvrt6G5MLJk88XFxbu5XU6650Lf16/rl32epm4YWTo5s2brc3NzcfSeuWmo/RRR8d5TdMOLlm8+JbA84Ucy+YCwKjfT8eDQTJp2BMMBvedPn16S1tb29m0W3fGAwTD8N91dS2zFxSs+Nvny77i9fr9fv/59vb2s1evXo1ket4/oXgLrXNMZZcAAAAASUVORK5CYII='>",
        recipeConfig: [{ op: "Render Image", args: ["Hex"] }],
    },
    {
        name: "Render Image: base64 jpg",
        input: JPG_B64,
        expectedOutput:
            "<img src='data:image/jpeg;base64,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'>",
        recipeConfig: [{ op: "Render Image", args: ["Base64"] }],
    },
    {
        name: "Extract EXIF: nothing",
        input: "",
        expectedOutput: "Found 0 tags.\n",
        recipeConfig: [
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Extract EXIF: hello world text (error)",
        input: "hello world",
        expectedOutput:
            "Could not extract EXIF data from image: Error: Invalid JPEG section offset",
        recipeConfig: [
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Extract EXIF: meerkat jpeg",
        input: EXIF_JPG_HEX,
        expectedOutput: [
            "Found 28 tags.",
            "",
            "Make: SONY",
            "Model: DSC-H5",
            "XResolution: 70",
            "YResolution: 70",
            "ResolutionUnit: 2",
            "Software: Pictomio 1.2.31.0",
            "ModifyDate: 1278286273",
            "ExposureTime: 0.008",
            "FNumber: 3.7",
            "ExposureProgram: 3",
            "ISO: 200",
            "DateTimeOriginal: 1220275486",
            "CreateDate: 1220275486",
            "ShutterSpeedValue: 6.965784",
            "ApertureValue: 3.775051",
            "ExposureCompensation: 0.3",
            "MaxApertureValue: 3",
            "MeteringMode: 5",
            "LightSource: 10",
            "Flash: 16",
            "FocalLength: 72",
            "CustomRendered: 0",
            "ExposureMode: 1",
            "WhiteBalance: 1",
            "SceneCaptureType: 0",
            "Contrast: 0",
            "Saturation: 0",
            "Sharpness: 0",
        ].join("\n"),
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Extract EXIF: avatar jpeg",
        input: NO_EXIF_JPG_HEX,
        expectedOutput: "Found 0 tags.\n",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Remove EXIF: hello world text (error)",
        input: "hello world",
        expectedOutput:
            "Could not remove EXIF data from image: Given data is not jpeg.",
        recipeConfig: [
            {
                op: "Remove EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Remove EXIF: meerkat jpeg (has EXIF)",
        input: EXIF_JPG_HEX,
        expectedOutput: "Found 0 tags.\n",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Remove EXIF",
                args: [],
            },
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Extract EXIF: avatar jpeg (has no EXIF)",
        input: NO_EXIF_JPG_HEX,
        expectedOutput: "Found 0 tags.\n",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Remove EXIF",
                args: [],
            },
            {
                op: "Extract EXIF",
                args: [],
            },
        ],
    },
    {
        name: "Extract RGBA",
        input: "424d460400000000000036040000280000000400000004000000010008000000000010000000120b0000120b0000000100000001000000c8000000cf000000d7000000df000000e7000000ef000000f7000000ff000083000000ac000000d5000000ff000000000083000000ac000000d5000000ff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f070d05030b01090c040e060008020a",
        expectedOutput:
            "0 200 0 0 0 131 0 215 0 0 0 213 131 0 0 0 231 0 213 0 0 0 247 0 0 223 0 0 0 255 0 207 0 0 0 172 255 0 0 0 255 0 172 0 0 0 239 0",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Extract RGBA",
                args: [" ", false],
            },
        ],
    },
    {
        name: "Extract LSB",
        input: PNG_HEX,
        expectedOutput:
            "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000240000000000000000000000208000000000000000000008000000000000000000000000248000000200240000000208908000000200240000000200821000000200240000000061249000000240000000000209b69000001a49b00000000a204a1200001a49b00000009800414000001a49b0000000035db6c00000094924000000086dffc20000df6dec8000001e10014a0000df6dec800002564924b00000df6dec80000009a6db20000007edb4124804177fffba0002fffff69249044e0924bc4002fffff6924905fb2db6d04002fffff692490416d2490040001bfffcc92030dbffffdc00037fffffdb6d302c6db6d700037fffffdb6d327eb6db6148037fffffdb6d30db4000014800dffffeb6d9aefffffff640",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Extract LSB",
                args: ["B", "G", "A", "", "Column", 2],
            },
            {
                op: "To Hex",
                args: ["None"],
            },
        ],
    },
    {
        name: "View Bit Plane",
        input: PNG_HEX,
        expectedOutput:
            "89504e470d0a1a0a0000000d4948445200000020000000200806000000737a7af400000140494441547801c5c1416ea3400000c1ee11ffff726fe6808410186ce26c95fde0432a154f0cdea4b2aa505151519954ee1a5c50995454aea8ac54ae2c5ca8982a3ea132551c199c507942e58ec1898adf50f1cae084ca15952b2a152a47067f40a5e2c8e00f54a81c199ca8b85271a542a5e2c8e005159527542ace0c5ea8a8f844c54ae5ccc217555c197c41c55d83ff6cf0052a772ddca052b1a752b1a772d7c2432a4f2c3c50f1d4c20b2a1593ca918a4965afe2cac29b2a562a93ca56c55d0b2754b62a269555c554b15251a9b8637040e5884ac54a654ba5a2624be5cce040c5918a55c55ec5a4a232a9549c197c48655239523155bc3278a862af624be5ccc2072aaea854a8549c5978834a85ca5ec5918a57ec076f50a958a9546ca94c1557ec071754a68a2d958a270637544c2a2abf69e1a68a95ca54b152a978d73f2e08bd57b6f839a00000000049454e44ae426082",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "View Bit Plane",
                args: ["Green", 3],
            },
            {
                op: "To Hex",
                args: ["None"],
            },
        ],
    },
    {
        name: "Randomize Colour Palette",
        input: PNG_HEX,
        expectedOutput:
            "89504e470d0a1a0a0000000d4948445200000020000000200806000000737a7af4000004f3494441547801c5c10b50cf0700c0f16fbfff8f0ae5f157ed9f1e446358ab28b3913f29b3f89f65deab9859c624cafbf557b6eb3662799c8a285c541479ed3c125d2d2cba52e45d4da8bc66b99d1ebbff6ddd75ddeff7efef75fb7c8c5cb5b10dbc869ccbd1ac4f0c67dfc55cba1f9ec32dd303bc0e854aadd1f20ace5f29e1c9346b4c3982aada03b3285b540f4b099f664ca5720321a34c582466b2f38f3e1842a1526bb4e811efe64a56403a465dc270a998cb517b47e62f7842870b6aaabc5b519627a253784e606a8e25470fbbe358a0c2fd692f9c9668b8bda084e77d5f2247448f790f42a9b9da915d415a6020508a3e49e207e8ec7961cb9594545657e5e26e0fdaf9df5014998a141119f16eae24b4db84f7d775bc8e3e3e9e24f12fabaccf282210292232ce6a5e12dab58e37656be7cf8893916498d72345404681d7365ae217b18b969495261019998f8569145204e47c3e99b7a58f8f278fa76e478a808c522f23de165b3b7f3aee9c8e14011956e9b6841c29419f5d8bfd6889ad9d3fc1c9c654be08428a808cfc9a0c02e7d711973a823751569ac0c79dd72347408fb9ee3d102f4c616d9c82579596dd8df1b5c58caf2d26625d2fe488b420b16c129e3d7825534ccbb01a3881f0803354adba49c5853ce488bc037ba66b48c93586e20298885e02ff338177c0a1ed600c256200973699b0f130cd9dafcd20c87a3bcd9d29d90b1462081103c4d444d1bee2139aab9b7c87ec50479adbd47f13a0c610227a94af8a6565ce118ce72dc1618d3b4ded6f678465840dd905bd519f3e455305e67eb4f1db8ed94fdeb444448f0dbb94740bcec029db9fa636fc99cbf176a708b9e44198af3573469b323cb992469694b031bd133b2a955cb2a8461f0119a3b6f810fcac81619ea1c42cbf43a3711393d8727b1ee37ad6a263b1388cc8a872264cc8a7d1c97116d407ede1ab9c44ac3de610e5f32372142ab5468b84d091d984d79a90147e8dfb8322e8bcf71cdf370ce07ae6158606ee479c164c8794ddf88f76664c5d3d96579ee171db85d9917524b996102e2e65d882753c4c28e690714f9e3ffa1b2902122a0e6571a3c8864657b304ee2e4d6579e1038e0879cc0c716765c67ec2ee1d63cbaa9154db0760ffcc8e0fd7f643d3ba9c31ce69fc3c68124507bae060eb8379dc45e4884850aa4730ca2e97e68a572ca178055c7ff411cb56c4002bf86ef6717c53f94f3c3a4ff72590d6fa09ef134ae0a983ec1efc2b720424fc55b8107dbea8fe81134ecee8687c4d68ae62de45bc636ad099782b126b8f39c81190b0f292127d5295cb98f2b415aa2a055dcb2fb035b081a686f48ee5f4d37ee80c9d91498855007204240cc9ea89efeabec871ec5443c381b1980c9a4f456d1233a38d68ce667c2ee7c2927019e1ce8bb84ce48848f832d10bb1f50dd6540d03d268d4677d39ed1d52514407d3b6d8830327dc49b0984574507b3a3b0573fb5806f762afa37379790e7783ab0849ee0f66fd91a350a9355a24d4bb754239ca02df597598d52dc5c2bb339503cde95213cff3a089240d7f48fd522f9c943eec1db088e53b0412631ea193dec188e4b3a7d9d6eb535a62e4aa8d6da005bfe4d9125de082dbcd6f69ca6ecc66c2166ca329eb198ee4bf5780a5ba3b861030c05cd732eea4acc3c42106671f0d52ac6738727064325b8ff5c752dd1d4329546a8d1603bc2c51f2bbf3356eae2c64b379374c964561b5f53c36d65e14fd3683c7f7179232d686bdf9777915ff00ec08ae8ecb66a3370000000049454e44ae426082",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"],
            },
            {
                op: "Randomize Colour Palette",
                args: ["myseed"],
            },
            {
                op: "To Hex",
                args: ["None"],
            },
        ],
    },
    /* { This operation only works in a browser
        name: "Optical Character Recognition",
        input: "iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0CAIAAABqhmJGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAASuSURBVHhe7dftVdswAIbRzsVAzMM0XabDUCOUxLYsWW4Jp+/pvf9w9GH76CHw4x2IJWAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAI9p8G/PbyY8rL2686g8t+vnqHTyfgIYfvz/26veTXn/UKX8+f0EU9bHrtu/6KfAN/AwEXAj7lFf2TBFw4nae8on+SgIvJ01n/KLzpDK+L3bT/Ap4O+HC+V12mTH+M3gzcLbIY/EO6HfxYp13k09nb6r3UqcdnjoCL3ll72J26h+35Oxy2XvZ0wOLaXq9v2+F1UC+7RZtMZ/DnfX1lwDOPzwUCLo7O2trtDK8H3M/iqoc6bj1subT68XTA/F7bGJooyzKbhTvLPHY8eJLHlbNX1DqYUVfdXbqwJjsCLsans37aNNJM6w68OR0wv9f9ymKw3k67yn2ZZpHlg3a3zis60s6oV+ZvlzMCLoanc3Dsdt9TdWT/lM8OmNjr5KY72jmzq1zfrbvXtVtmRMDF8HTWcgaaqIrD1U4G/MFewxrW262s5jS/Fzpmdts6mnHy+Fwl4GJ0OjsNrG1P/y7CNo3+gEt7jW56MVprNed7A/5w+n6YJ+BieDpnj/jO6pweTz0acGWvmZveL9XOmd3x6wKuTt8PEwRczLRw4eje1XX7c/cDruw1uuneOu2c4aOvzI57mJhRh1xZlQ0BF+Oz9vcF96fuB1zYa7R2b5mD6/XSwdfg8snj4q21+W/L02dfzIxhQMDFyTm6Hd7m+JYP7rPKT5sRuzhOBywm91rUkYc3fV9ltchtr8VmzuGOdfDB9N1tFYefNfdXLmyGjNZkhoCLUQufVqd/7z7rUcLW/XieDvg0s9difNOdRV5ePibt5vTuazusWbF9rs2E5v4mH58LBFyMW7g5OID7s9cMuTygmt9rcNPb5MrAz0lHc3Z9Ht7XZsxqxO36ZtLR/c0+PpMEzLOc/4LhrwmYZ6lfywJ+JgHzJPr9DgLmi23/zdXvcwmYL7YKWL1PJ2AIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmAIJmCI9f7+G6yFxVg/GyYwAAAAAElFTkSuQmCC",
        expectedOutput: "Tesseract.js\n",
        recipeConfig: [
            {
                "op": "From Base64",
                "args": ["A-Za-z0-9+/=", true]
            },
            {
                "op": "Optical Character Recognition",
                "args": [false]
            }
        ]
    } */
]);
