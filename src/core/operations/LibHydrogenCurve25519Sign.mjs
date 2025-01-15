/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable no-console */
/**
 * @author Configured Things Ltd. [getconfigured@configuredthings.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

import * as hydro from  "libhydrogen/libHydrogen.js";

/**
 * LibHydrogen Curve25519 Sign operation
 */
class LibHydrogenCurve25519Signing extends Operation {

    /**
     * LibHydrogenCurve25519Sign constructor
     */
    constructor() {
        super();

        this.name = "LibHydrogen Curve25519 Sign";
        this.module = "Crypto";
        this.description = "Computes a signature for a message using the lightweight LibHydrogen cryptography library";
        this.infoURL = "https://libhydrogen.org/";
        this.inputType = "byteArray";
        this.outputType = "JSON";
        this.args = [
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const [firstArg, secondArg] = args;
        (async () => {
            const wasm_src = await fetch(new URL(`${self.docURL}/assets/libhydrogen/libhydrogen.wasm`));
            const wasm = await WebAssembly.compileStreaming(wasm_src);
            const imports = {
                "wasi_snapshot_preview1": {
                    args_get() {
                        return 0;
                    },
                    args_sizes_get() {
                        return 0;
                    },
                    clock_res_get() {
                        return 0;
                    },
                    clock_time_get() {
                        return 0;
                    },
                    environ_sizes_get() {
                        return 0;
                    },
                    environ_get() {
                        return 0;
                    },
                    proc_exit() {
                        return 0;
                    },
                    fd_write() {
                        return 0;
                    },
                    fd_advise() {
                        return 0;
                    },
                    fd_allocate() {
                        return 0;
                    },
                    fd_close() {
                        return 0;
                    },
                    fd_datasync() {
                        return 0;
                    },
                    fd_fdstat_get() {
                        return 0;
                    },
                    fd_fdstat_set_flags() {
                        return 0;
                    },
                    fd_fdstat_set_rights() {
                        return 0;
                    },
                    fd_filestat_get() {
                        return 0;
                    },
                    fd_filestat_set_size() {
                        return 0;
                    },
                    fd_filestat_set_times() {
                        return 0;
                    },
                    fd_pread() {
                        return 0;
                    },
                    fd_prestat_get() {
                        return 0;
                    },
                    fd_prestat_dir_name() {
                        return 0;
                    },
                    fd_pwrite() {
                        return 0;
                    },
                    fd_read() {
                        return 0;
                    },
                    fd_readdir() {
                        return 0;
                    },
                    fd_renumber() {
                        return 0;
                    },
                    fd_seek() {
                        return 0;
                    },
                    fd_sync() {
                        return 0;
                    },
                    fd_tell() {
                        return 0;
                    },
                    path_create_directory() {
                        return 0;
                    },
                    path_filestat_get() {
                        return 0;
                    },
                    path_filestat_set_times() {
                        return 0;
                    },
                    path_link() {
                        return 0;
                    },
                    path_open() {
                        return 0;
                    },
                    path_readlink() {
                        return 0;
                    },
                    path_remove_directory() {
                        return 0;
                    },
                    path_rename() {
                        return 0;
                    },
                    path_symlink() {
                        return 0;
                    },
                    path_unlink_file() {
                        return 0;
                    },
                    poll_oneoff() {
                        return 0;
                    },
                    sched_yield() {
                        return 0;
                    },
                    random_get() {
                        return 0;
                    },
                    sock_accept() {
                        return 0;
                    },
                    sock_recv() {
                        return 0;
                    },
                    sock_send() {
                        return 0;
                    },
                    sock_shutdown() {
                        return 0;
                    },
                }
            };
            instance = await WebAssembly.instantiate(wasm, imports);
            // We must call a start method per WASI specification
            // Libhydrogen's main method is one we have patched to initialise it
            instance.exports._start();
            // Get the memory are used as a stack when calling into the WASI
            const memory = instance.exports.memory;
            // DataView takes care of our platform specific endian conversions
            dataview = new DataView(memory.buffer);
            // Run the various examples
            random_uniform();
            hash();
            keyed_hash();
            public_key_signing();
            symmetric_encryption();
            symmetric_encryption_via_asymmetric_key_exchange();
        })();
        return {};
    }

}

let instance, dataview;

//
// Helper function to reserve space in the buffer used
// as a stack between Node and the wasm.
//
// Offset must be an an object so we can update it's value
//   {value: n}
//
// Designed to allow a sequence of reservations such as
//
//  let offset = {value: 0};
//  buf1 = reserve (offset, 100);
//  buf2 = reserve (offset, 590);
//  ...
//
function reserve(offset, length) {
    const a = new Uint8Array(dataview.buffer, offset.value, length);
    const newOffset = a.byteOffset + a.byteLength;
    offset.value = newOffset;
    return a;
}

//
// Generate a series of random numbers
//
function random_uniform() {
    console.log("\n=== random_uniform ===\n");
    const { hydro_random_uniform } = instance.exports;
    // Testing a simple case of passing integers and fetching integers
    console.log(`generated random - ${hydro_random_uniform(20)}`);
    console.log(`generated random - ${hydro_random_uniform(20)}`);
    console.log(`generated random - ${hydro_random_uniform(20)}`);
    console.log(`generated random - ${hydro_random_uniform(20)}`);
    console.log(`generated random - ${hydro_random_uniform(20)}`);
}

//
// Hash Generation
//
function hash() {
    console.log("\n=== hash ===\n");
    const { hydro_hash_hash } = instance.exports;
    const textEncoder = new TextEncoder();

    // We have to create the stack frame to pass to libHydrogen
    // in the dataview Buffer, and then pass in pointers to
    // that buffer

    const offset = { value: 0 };
    const context_str = "Examples";
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const examples_ab = textEncoder.encode(context_str);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([examples_ab.at(i)], i);
    }

    // Our message to be hashed
    const message_str = "Arbitrary data to hash";
    const message_ab = textEncoder.encode(message_str);
    const message_arr = reserve(offset, message_ab.length);

    for (let i = 0; i < message_ab.length; i++) {
        message_arr.set([message_ab.at(i)], i);
    }

    // Buffer for libHydrogen to write the hash into
    const hash = reserve(offset, hydro.hash_BYTES);

    // Call the imported function
    hydro_hash_hash(
        hash.byteOffset,
        hash.length,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        null,
    );
    console.log(`generated hash - ${Buffer.from(hash).toString("hex")}`);
}

//
// Hash generation with a key
//
function keyed_hash() {
    console.log("\n=== keyed_hash ===\n");

    // Importing libhydrogen's hashing keygen and hash functions
    const { hydro_hash_keygen, hydro_hash_hash } = instance.exports;
    const textEncoder = new TextEncoder();

    // We have to create the stack frame to pass to libHydrogen
    // in the dataview Buffer, and then pass in pointers to
    // that buffer
    const offset = { value: 0 };
    const context_str = "Examples";
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const examples_ab = textEncoder.encode(context_str);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([examples_ab.at(i)], i);
    }

    const message_str = "Arbitrary data to hash";
    const message_ab = textEncoder.encode(message_str);
    const message_arr = reserve(offset, message_ab.length);

    for (let i = 0; i < message_ab.length; i++) {
        message_arr.set([message_ab.at(i)], i);
    }

    // Reserve buffer space for the returned key
    const key = reserve(offset, hydro.hash_KEYBYTES);

    // Reserve space for the hash result
    const keyedhash = reserve(offset, hydro.hash_BYTES);

    // Generate hashing key
    hydro_hash_keygen(key.byteOffset);
    console.log(`generated hash key - ${key}`);

    // Create a hash with the key
    hydro_hash_hash(
        keyedhash.byteOffset,
        keyedhash.length,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        key.byteOffset,
    );
    const khash1 = keyedhash.toString("hex");
    console.log(`khash1 - ${khash1}`);

    keyedhash.fill(0); // Resetting output buffer (seems to pollute state otherwise)

    // Hashing message with key again
    hydro_hash_hash(
        keyedhash.byteOffset,
        keyedhash.length,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        key.byteOffset,
    );
    const khash2 = keyedhash.toString("hex");
    console.log(`khash2 - ${khash2}`);
    keyedhash.fill(0);
    console.log(`${keyedhash.toString("hex")}`);

    // Check that the same hash is generated
    if (khash1 === khash2) console.log("khash1 equals khash2");

    // Testing whether we can load a key and generate a matching hash created previously
    const presetKey = "f539065185b3ce774b0c748564e804a3717ca7d0c08231076e8b7920814f0bba";
    console.log(`presetKey - ${presetKey}`);

    const historicHash = "4004516ceff97883804dbdb221baeb7283256e60165d0715d0152e4d6a6cbad4";
    console.log(`historicHash - ${historicHash}`);

    const loadedKey = new Uint8Array(presetKey.match(/../g).map(h=>parseInt(h, 16)));
    for (let i = 0; i < loadedKey.length; i++) {
        key.set([loadedKey.at(i)], i);
    }

    // Hashing message with presetKey
    hydro_hash_hash(
        keyedhash.byteOffset,
        keyedhash.length,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        key.byteOffset,
    );

    const khash3 = keyedhash.toString("hex");
    console.log(`khash3 - ${khash3}`);

    // Testing hash matches historicHash
    if (khash3 === historicHash)
        console.log("khash3 using old key, matches historicHash");

    // ...and doesn't match the hashes with the latest key
    if (khash1 !== khash3)
        console.log("khash3 does not equal khash1");

    // clear the buffer for the next example
    context_arr.fill(0);
    message_arr.fill(0);
    keyedhash.fill(0);
    key.fill(0);
}

//
// Public key signing
//
function public_key_signing() {
    console.log("\n=== public_key_signing ===\n");

    // Importing libhydrogen's signing keygen and signing and verification functions
    const { hydro_sign_keygen, hydro_sign_create, hydro_sign_verify } = instance.exports;
    const textEncoder = new TextEncoder();

    // We have to create the stack frame to pass to libHydrogen
    // in the dataview Buffer, and then pass in pointers to
    // that buffer
    const offset = { value: 0 };
    const context_str = "Examples";
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const examples_ab = textEncoder.encode(context_str);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([examples_ab.at(i)], i);
    }

    const message_str = "Arbitrary data to hash";
    const message_ab = textEncoder.encode(message_str);
    const message_arr = reserve(offset, message_ab.length);

    for (let i = 0; i < message_ab.length; i++) {
        message_arr.set([message_ab.at(i)], i);
    }

    // Generate a key pair
    const keypair = reserve(offset, hydro.sign_PUBLICKEYBYTES + hydro.sign_SECRETKEYBYTES);
    const publicKeyOffset = keypair.byteOffset;
    const privateKeyOffset = keypair.byteOffset + hydro.sign_PUBLICKEYBYTES;
    hydro_sign_keygen(keypair.byteOffset);

    // Reserving memory for the signature
    const signature = reserve(offset, hydro.sign_BYTES);

    // Creating signature of message with secret key
    hydro_sign_create(
        signature.byteOffset,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        privateKeyOffset,
    );

    console.log(`generated signature - ${Buffer.from(signature).toString("hex")}`);

    // Verifying signature with public key
    const res = hydro_sign_verify(
        signature.byteOffset,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        publicKeyOffset,
    );

    if (res === 0) console.log("Signature is correctly valid");
    signature.set([0]); // Modifying signature
    console.log(`modified signature - ${Buffer.from(signature).toString("hex")}`);

    const manipulatedRes = hydro_sign_verify(
        signature.byteOffset,
        message_arr.byteOffset, // Reverifying signature
        message_arr.byteLength,
        context_arr.byteOffset,
        publicKeyOffset,
    );
    if (manipulatedRes !== 0) console.log("Signature is correctly invalid");

    message_arr.fill(0);
    keypair.fill(0);
    signature.fill(0);
}

//
// Secret Key Encryption
//
function symmetric_encryption() {
    console.log("\n=== symmetric_encryption ===\n");

    // Importing libhydrogen's secretbox keygen and encrypt and decrypt functions
    const { hydro_secretbox_keygen, hydro_secretbox_encrypt, hydro_secretbox_decrypt } =
        instance.exports;
    const textEncoder = new TextEncoder();

    // We have to create the stack frame to pass to libHydrogen
    // in the dataview Buffer, and then pass in pointers to
    // that buffer
    const offset = { value: 0 };
    const context_str = "Examples";
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const examples_ab = textEncoder.encode(context_str);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([examples_ab.at(i)], i);
    }

    // Reserving buffer for the message
    const message_str = "Arbitrary data to hash";
    const message_ab = textEncoder.encode(message_str);
    const message_arr = reserve(offset, message_ab.length);

    for (let i = 0; i < message_ab.length; i++) {
        message_arr.set([message_ab.at(i)], i);
    }
    console.log(`message - ${message_arr}`);

    // Reserving buffer for the key
    const key = reserve(offset, hydro.secretbox_KEYBYTES);
    hydro_secretbox_keygen(key.byteOffset);
    console.log(`generated key - ${key.toString("hex")}`);

    // Reserving buffer for the cipher text
    const cipherTextLength = hydro.secretbox_HEADERBYTES + message_arr.length;
    const ciphertext = reserve(offset, cipherTextLength);

    // Enciphering single message (thus use of msg_id 0n -- 'n' as libhydrogen expects i64)
    hydro_secretbox_encrypt(
        ciphertext.byteOffset,
        message_arr.byteOffset,
        message_arr.byteLength,
        0n,
        context_arr.byteOffset,
        key.byteOffset,
    );

    // Reserving buffer for the decrypted plain text
    const decryptedPlaintextLength = ciphertext.byteLength - hydro.secretbox_HEADERBYTES;
    const decryptedPlaintext = reserve(offset, decryptedPlaintextLength);

    // Deciphering single message (thus use of msg_id 0n -- 'n' as libhydrogen expects i64)
    const res = hydro_secretbox_decrypt(
        decryptedPlaintext.byteOffset,
        ciphertext.byteOffset,
        ciphertext.byteLength,
        0n,
        context_arr.byteOffset,
        key.byteOffset,
    );
    if (res === 0) {
        // As secretbox is an authenticated encryption (AEAD) algorithm
        // we check that the ciphertext was authentic
        console.log("cipherText not forged");
        // Decoding Uint8 encoded string
        const textDecoder = new TextDecoder();
        console.log(`decryptedPlaintext - ${textDecoder.decode(decryptedPlaintext)}`);
    }

    message_arr.fill(0);
    key.fill(0);
    ciphertext.fill(0);
    decryptedPlaintext.fill(0);
}

//
// Symmetric Encryption using a Key Generated
// via Asymmetric key exchange
//
function symmetric_encryption_via_asymmetric_key_exchange() {
    console.log("\n=== symmetric_encryption_via_asymmetric_key_exchange ===\n");

    const { hydro_kx_keygen, hydro_kx_kk_1, hydro_kx_kk_2, hydro_kx_kk_3 } = instance.exports;
    const textEncoder = new TextEncoder();

    //
    // Reserve space in the buffer for the keypair exchange
    //
    // Both Alice and Bob need a keypair
    //
    // Both Alice and bob need a pair of session keys
    //    tx to encrpyt
    //    rx to decrypt
    //
    // Alice initiates the key exchange, so she also needs a kx state
    // buffer
    //

    const offset = { value: 0 };
    const alice = {
        static: {
            pk: reserve(offset, hydro.kx_PUBLICKEYBYTES),
            sk: reserve(offset, hydro.kx_SECRETKEYBYTES),
        },
        session: {
            rx: reserve(offset, hydro.kx_SESSIONKEYBYTES),
            tx: reserve(offset, hydro.kx_SESSIONKEYBYTES),
        },
    };

    const bob = {
        static: {
            pk: reserve(offset, hydro.kx_PUBLICKEYBYTES),
            sk: reserve(offset, hydro.kx_SECRETKEYBYTES),
        },
        session: {
            rx: reserve(offset, hydro.kx_SESSIONKEYBYTES),
            tx: reserve(offset, hydro.kx_SESSIONKEYBYTES),
        },
    };

    const keysOffset = offset.value;
    alice.state = reserve(offset, hydro.kx_SESSIONKEYBYTES);

    // We need two "packets" for the messages exchanged between
    // Alice and Bob during the key exchange
    const packets = {
        1: reserve(offset, hydro.kx_KK_PACKET1BYTES),
        2: reserve(offset, hydro.kx_KK_PACKET2BYTES),
    };

    console.log("\n=== symmetric_encryption_via_asymmetric_key_exchange ===\n");
    //
    // Generate the static keys
    //
    console.log("------------ALICEKEYGEN------------");
    hydro_kx_keygen(alice.static.pk.byteOffset);
    console.log("---------------ALICE---------------");
    console.log(alice);

    console.log("-------------BOBKEYGEN-------------");
    hydro_kx_keygen(bob.static.pk.byteOffset);
    console.log("----------------BOB----------------");
    console.log(bob);

    //
    // Key exchange
    //

    // Performing kk_1 (Generating alice's ephemeral keypair and packet 1)
    console.log("-----------hydro_kx_kk_1-----------");
    hydro_kx_kk_1(
        alice.state.byteOffset,
        packets[1].byteOffset,
        bob.static.pk.byteOffset,
        alice.static.pk.byteOffset,
    );
    console.log("---------------ALICE---------------");
    console.dir(alice, { maxArrayLength: null });
    console.log("--------------packets--------------");
    console.log(packets);

    // Performing kk_2 (Generating bob's response packet 2 and his copy of session keys)
    console.log("-----------hydro_kx_kk_2-----------");
    hydro_kx_kk_2(
        bob.session.rx.byteOffset,
        packets[2].byteOffset,
        packets[1].byteOffset,
        alice.static.pk.byteOffset,
        bob.static.pk.byteOffset,
    );
    console.log("----------------BOB----------------");
    console.dir(bob, { maxArrayLength: null });
    console.log("--------------packets--------------");
    console.log(packets);

    // Performing kk_3 (Generating Alice's copy of session keys)
    console.log("-----------hydro_kx_kk_3-----------");
    hydro_kx_kk_3(
        alice.state.byteOffset,
        alice.session.rx.byteOffset,
        packets[2].byteOffset,
        alice.static.pk.byteOffset,
    );
    console.log("---------------ALICE---------------");
    console.dir(alice, { maxArrayLength: null });

    console.log("-----------KEYS EXCHANGED----------");

    // Tidy up the buffer space used in the key exchange
    alice.state.fill(0);
    packets[1].fill(0);
    packets[2].fill(0);
    offset.value = keysOffset;

    //
    // Use the session keys to exchange messages
    //
    const { hydro_secretbox_encrypt, hydro_secretbox_decrypt } = instance.exports;

    const context_str = "Examples";
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const examples_ab = textEncoder.encode(context_str);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([examples_ab.at(i)], i);
    }

    const message1_str = "Hello Bob";
    const message1_ab = textEncoder.encode(message1_str);
    const message1_arr = reserve(offset, message1_ab.length);

    for (let i = 0; i < message1_ab.length; i++) {
        message1_arr.set([message1_ab.at(i)], i);
    }

    console.log(`message1_arr - ${message1_arr}`);

    const ciphertext1_length = hydro.secretbox_HEADERBYTES + message1_arr.length;
    const ciphertext1_arr = reserve(offset, ciphertext1_length);

    //
    // Alice Encypts the message with her session tx key
    //
    // Enciphering single message (thus use of msg_id 0n -- 'n' as libhydrogen expects i64)
    //
    hydro_secretbox_encrypt(
        ciphertext1_arr.byteOffset,
        message1_arr.byteOffset,
        message1_arr.byteLength,
        0n,
        context_arr.byteOffset,
        alice.session.tx.byteOffset,
    );

    //
    // Bob Decrypts the mesaage with his session rx key
    //
    // Deciphering single message (thus use of msg_id 0n -- 'n' as libhydrogen expects i64)
    //
    const decryptedPlaintext1Length = ciphertext1_arr.byteLength - hydro.secretbox_HEADERBYTES;
    const decryptedPlaintext1 = reserve(offset, decryptedPlaintext1Length);

    const res1 = hydro_secretbox_decrypt(
        decryptedPlaintext1.byteOffset,
        ciphertext1_arr.byteOffset,
        ciphertext1_arr.byteLength,
        0n,
        context_arr.byteOffset,
        bob.session.rx.byteOffset,
    );

    // As secretbox is an authenticated encryption (AEAD) algorithm
    // we check that the ciphertext was authentic
    if (res1 === 0) {
        console.log("ciphertext1_arr not forged");
        // Decoding Uint8 encoded string
        const textDecoder = new TextDecoder();
        console.log(`decryptedPlaintext1 - ${textDecoder.decode(decryptedPlaintext1)}`);
    }

    //
    // Bob sends a reply to Alice
    //
    const message2_str = "Hello Alice";
    const message2_ab = textEncoder.encode(message2_str);
    const message2_arr = reserve(offset, message2_ab.length);

    for (let i = 0; i < message2_ab.length; i++) {
        message2_arr.set([message2_ab.at(i)], i);
    }

    console.log(`message2_arr - ${message2_arr}`);

    const ciphertext2Length = hydro.secretbox_HEADERBYTES + message2_arr.length;
    const ciphertext2_arr = reserve(offset, ciphertext2Length);

    //
    // Bob encrypts the message with his session tx key
    //
    hydro_secretbox_encrypt(
        ciphertext2_arr.byteOffset,
        message2_arr.byteOffset,
        message2_arr.byteLength,
        0n,
        context_arr.byteOffset,
        bob.session.tx.byteOffset,
    );

    //
    // Alice decrypts the message with her session rx key
    //
    const decryptedPlaintext2Length = ciphertext2_arr.byteLength - hydro.secretbox_HEADERBYTES;
    const decryptedPlaintext2_arr = reserve(offset, decryptedPlaintext2Length);

    const res2 = hydro_secretbox_decrypt(
        decryptedPlaintext2_arr.byteOffset,
        ciphertext2_arr.byteOffset,
        ciphertext2_arr.byteLength,
        0n,
        context_arr.byteOffset,
        alice.session.rx.byteOffset,
    );

    // As secretbox is an authenticated encryption (AEAD) algorithm
    // we check that the ciphertext was authentic
    if (res2 === 0) {
        console.log("ciphertext2 not forged");
        const textDecoder = new TextDecoder();
        // Decoding Uint8 encoded string
        console.log(`decryptedPlaintext2 - ${textDecoder.decode(decryptedPlaintext2_arr)}`);
    }
}


export default LibHydrogenCurve25519Signing;
