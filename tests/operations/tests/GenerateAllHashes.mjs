/**
 * GenerateAllHashes tests.
 *
 * @author john19696 [john19696@protonmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Full generate all hashes",
        input: "test",
        expectedOutput: `MD2:          dd34716876364a02d0195e2fb9ae2d1b
MD4:          db346d691d7acc4dc2625db19f9e3f52
MD5:          098f6bcd4621d373cade4e832627b4f6
MD6:          93c8a7d0ff132f325138a82b2baa98c12a7c9ac982feb6c5b310a1ca713615bd
SHA0:         f8d3b312442a67706057aeb45b983221afb4f035
SHA1:         a94a8fe5ccb19ba61c4c0873d391e987982fbbd3
SHA2 224:     90a3ed9e32b2aaf4c61c410eb925426119e1a9dc53d4286ade99a809
SHA2 256:     9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
SHA2 384:     768412320f7b0aa5812fce428dc4706b3cae50e02a64caa16a782249bfe8efc4b7ef1ccb126255d196047dfedf17a0a9
SHA2 512:     ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff
SHA3 224:     3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b
SHA3 256:     36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
SHA3 384:     e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd
SHA3 512:     9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14
Keccak 224:   3be30a9ff64f34a5861116c5198987ad780165f8366e67aff4760b5e
Keccak 256:   9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658
Keccak 384:   53d0ba137307d4c2f9b6674c83edbd58b70c0f4340133ed0adc6fba1d2478a6a03b7788229e775d2de8ae8c0759d0527
Keccak 512:   1e2e9fc2002b002d75198b7503210c05a1baac4560916a3c6d93bcce3a50d7f00fd395bf1647b9abb8d1afcc9c76c289b0c9383ba386a956da4b38934417789e
Shake 128:    d3b0aa9cd8b7255622cebc631e867d4093d6f6010191a53973c45fec9b07c774
Shake 256:    b54ff7255705a71ee2925e4a3e30e41aed489a579d5595e0df13e32e1e4dd202a7c7f68b31d6418d9845eb4d757adda6ab189e1bb340db818e5b3bc725d992fa
RIPEMD-128:   f1abb5083c9ff8a9dbbca9cd2b11fead
RIPEMD-160:   5e52fee47e6b070565f74372468cdc699de89107
RIPEMD-256:   fe0289110d07daeee9d9500e14c57787d9083f6ba10e6bcb256f86bb4fe7b981
RIPEMD-320:   3b0a2e841e589cf583634a5dd265d2b5d497c4cc44b241e34e0f62d03e98c1b9dc72970b9bc20eb5
HAS-160:      cb15e491eec6e769771d1f811315139c93071084
Whirlpool-0:  d50ff71342b521974bae166539871922669afcfc7181250ebbae015c317ebb797173a69e7a05afd11099a9f0918159cd5bc88434d3ca44513d7263caea9244fe
Whirlpool-T:  e6b4aa087751b4428171777f1893ba585404c7e0171787720eba0d8bccd710dc2c42f874c572bfae4cedabf50f2c80bf923805d4e31c504b86ca3bc59265e7dd
Whirlpool:    b913d5bbb8e461c2c5961cbe0edcdadfd29f068225ceb37da6defcf89849368f8c6c2eb6a4c4ac75775d032a0ecfdfe8550573062b653fe92fc7b8fb3b7be8d6
BLAKE2b-128:  44a8995dd50b6657a037a7839304535b
BLAKE2b-160:  a34fc3b6d2cce8beb3216c2bbb5e55739e8121ed
BLAKE2b-256:  928b20366943e2afd11ebc0eae2e53a93bf177a4fcf35bcc64d503704e65e202
BLAKE2b-384:  8a84b8666c8fcfb69f2ec41f578d7c85fbdb504ea6510fb05b50fcbf7ed8153c77943bc2da73abb136834e1a0d4f22cb
BLAKE2b-512:  a71079d42853dea26e453004338670a53814b78137ffbed07603a41d76a483aa9bc33b582f77d30a65e6f29a896c0411f38312e1d66e0bf16386c86a89bea572
BLAKE2s-128:  e9ddd9926b9dcb382e09be39ba403d2c
BLAKE2s-160:  d6197dabec2bd6f4ff303b8e519e8f15d42a453d
BLAKE2s-256:  f308fc02ce9172ad02a7d75800ecfc027109bc67987ea32aba9b8dcc7b10150e
Streebog-256: 12a50838191b5504f1e5f2fd078714cf6b592b9d29af99d0b10d8d02881c3857
Streebog-512: 7200bf5dea560f0d7960d07fdc8874ad9f3b86ece2e45f5502ae2e176f2c928e0e581152281f5aee818318bed7cbe6aa69999589234723ceb33175598365b5c8
GOST:         ee67303696d205ddd2b2363e8e01b4b7199a80957d94d7678eaad3fc834c5a27
LM Hash:      01FC5A6BE7BC6929AAD3B435B51404EE
NT Hash:      0CB6948805F797BF2A82807973B89537
SSDEEP:       3:Hn:Hn
CTPH:         A:E:E

Checksums:
Fletcher-8:   3d
Fletcher-16:  5dc1
Fletcher-32:  3f5cd9e7
Fletcher-64:  7473657474736574
Adler-32:     045d01c1
CRC-8:        b9
CRC-16:       f82e
CRC-32:       d87f7e0c
`,
        recipeConfig: [
            {
                op: "Generate all hashes",
                args: ["All", true],
            },
        ],
    },
    {
        name: "Hashes with length 32",
        input: "test",
        expectedOutput: `MD2:          dd34716876364a02d0195e2fb9ae2d1b
MD4:          db346d691d7acc4dc2625db19f9e3f52
MD5:          098f6bcd4621d373cade4e832627b4f6
RIPEMD-128:   f1abb5083c9ff8a9dbbca9cd2b11fead
BLAKE2b-128:  44a8995dd50b6657a037a7839304535b
BLAKE2s-128:  e9ddd9926b9dcb382e09be39ba403d2c
LM Hash:      01FC5A6BE7BC6929AAD3B435B51404EE
NT Hash:      0CB6948805F797BF2A82807973B89537
`,
        recipeConfig: [
            {
                op: "Generate all hashes",
                args: ["128", true],
            },
        ],
    },
    {
        name: "Hashes without names",
        input: "test",
        expectedOutput: `93c8a7d0ff132f325138a82b2baa98c12a7c9ac982feb6c5b310a1ca713615bd
9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658
d3b0aa9cd8b7255622cebc631e867d4093d6f6010191a53973c45fec9b07c774
fe0289110d07daeee9d9500e14c57787d9083f6ba10e6bcb256f86bb4fe7b981
928b20366943e2afd11ebc0eae2e53a93bf177a4fcf35bcc64d503704e65e202
f308fc02ce9172ad02a7d75800ecfc027109bc67987ea32aba9b8dcc7b10150e
12a50838191b5504f1e5f2fd078714cf6b592b9d29af99d0b10d8d02881c3857
ee67303696d205ddd2b2363e8e01b4b7199a80957d94d7678eaad3fc834c5a27
`,
        recipeConfig: [
            {
                op: "Generate all hashes",
                args: ["256", false],
            },
        ],
    },
]);
