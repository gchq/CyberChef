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

import * as hydro from  "@configuredthings/libhydrogen-wasm/libHydrogen.js";

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
        this.inputType = "JSON";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Context",
                type: "string",
                value: ""
            },
            {
                name: "Sender's private key",
                type: "byteArray",
                value: ""
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    async run(input, args) {
        const [context, privateKey] = args;
        const wasm_src = await fetch(new URL(`${self.docURL}/assets/libhydrogen-wasm/libhydrogen.wasm`));
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
                random_get(buf, buf_len) {
                    const random_arr = new Uint8Array(dataview.buffer, buf, buf_len);
                    crypto.getRandomValues(random_arr);
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
        // Get the memory are used as a stack when calling into the WASI
        const memory = instance.exports.memory;
        // DataView takes care of our platform specific endian conversions
        dataview = new DataView(memory.buffer);
        // We must call a start method per WASI specification
        // Libhydrogen's main method is one we have patched to initialise it
        instance.exports._start();
        // Generated signature for JSON input
        return await sign(input, context, privateKey);
    }

}

let instance, dataview;

//
// Helper function to reserve space in the buffer used
// as a stack between js and the wasm.
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
// Public key signing
//
async function sign(input, context, privateKey) {
    // Importing libhydrogen's signing keygen and signing and verification functions
    const { hydro_sign_keygen, hydro_sign_create, hydro_sign_verify } = instance.exports;
    const textEncoder = new TextEncoder();

    // We have to create the stack frame to pass to libHydrogen
    // in the dataview Buffer, and then pass in pointers to
    // that buffer
    const offset = { value: 0 };
    const context_arr = reserve(offset, hydro.hash_CONTEXTBYTES);
    const context_ab = textEncoder.encode(context);

    for (let i = 0; i < hydro.hash_CONTEXTBYTES; i++) {
        context_arr.set([context_ab.at(i)], i);
    }

    const message_ab = textEncoder.encode(JSON.stringify(input));
    const message_arr = reserve(offset, message_ab.length);

    for (let i = 0; i < message_ab.length; i++) {
        message_arr.set([message_ab.at(i)], i);
    }

    // Generate a key pair
    const privateKey_arr = reserve(offset, hydro.sign_SECRETKEYBYTES);
    for (let i = 0; i < privateKey.length; i++) {
        privateKey_arr.set([privateKey.at(i)], i);
    }

    // Reserving memory for the signature
    const signature = reserve(offset, hydro.sign_BYTES);

    // Creating signature of message with secret key
    hydro_sign_create(
        signature.byteOffset,
        message_arr.byteOffset,
        message_arr.byteLength,
        context_arr.byteOffset,
        privateKey_arr.byteOffset,
    );

    console.log(`generated signature - ${Buffer.from(signature).toString("hex")}`);

    return {
        context,
        input,
        signature: Buffer.from(signature).toString("hex")
    };
}

export default LibHydrogenCurve25519Signing;
