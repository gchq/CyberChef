/**
 * Base32 Tests
 *
 * @author Peter C-S [petercs@purelymail.com]
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";
import {ALPHABET_OPTIONS} from "../../../src/core/lib/Base32.mjs";

// Example Standard Base32 Tests
const STANDARD_INP = "HELLO BASE32";
const STANDARD_OUT = "JBCUYTCPEBBECU2FGMZA====";

// Example Hex Extended Base32 Tests
const EXTENDED_INP = "HELLO BASE32 EXTENDED";
const EXTENDED_OUT = "912KOJ2F41142KQ56CP20HAOAH2KSH258G======";

// All Bytes
const ALL_BYTES = [
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
    "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
    "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f",
    "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f",
    "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f",
    "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f",
    "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f",
    "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f",
    "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f",
    "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f",
    "\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf",
    "\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf",
    "\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf",
    "\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf",
    "\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef",
    "\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
].join("");

const ALL_BYTES_EXTENDED_OUT = "000G40O40K30E209185GO38E1S8124GJ2GAHC5OO34D1M70T3OFI08924CI2A9H750KIKAPC5KN2UC1H68PJ8D9M6SS3IEHR7GUJSFQ085146H258P3KGIAA9D64QJIFA18L4KQKALB5EM2PB9DLONAUBTG62OJ3CHIMCPR8D5L6MR3DDPNN0SBIEDQ7ATJNF1SNKURSFLV7V041GA1O91C6GU48J2KBHI6OT3SGI699754LIQBPH6CQJEE9R7KVK2GQ58T4KMJAFA59LALQPBDELUOB3CLJMIQRDDTON6TBNF5TNQVS1GE2OF2CBHM7P34SLIUCPN7CVK6HQB9T9LEMQVCDJMMRRJETTNV0S7HE7P75SRJUHQFATFMERRNFU3OV5SVKUNRFFU7PVBTVPVFUVS======";
const ALL_BYTES_STANDARD_OUT = "AAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSAIJCEMSCKJRHFAUSUKZMFUXC6MBRGIZTINJWG44DSOR3HQ6T4P2AIFBEGRCFIZDUQSKKJNGE2TSPKBIVEU2UKVLFOWCZLJNVYXK6L5QGCYTDMRSWMZ3INFVGW3DNNZXXA4LSON2HK5TXPB4XU634PV7H7AEBQKBYJBMGQ6EITCULRSGY5D4QSGJJHFEVS2LZRGM2TOOJ3HU7UCQ2FI5EUWTKPKFJVKV2ZLNOV6YLDMVTWS23NN5YXG5LXPF5X274BQOCYPCMLRWHZDE4VS6MZXHM7UGR2LJ5JVOW27MNTWW33TO55X7A4HROHZHF43T6R2PK5PWO33XP6DY7F47U6X3PP6HZ7L57Z7P674======";

TestRegister.addTests([
    {
        name: "To Base32 Standard: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[0].value],
            },
        ],
    },
    {
        name: "To Base32 Hex Extended: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[1].value],
            },
        ],
    },
    {
        name: "From Base32 Standard: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[0].value, false],
            },
        ],
    },
    {
        name: "From Base32 Hex Extended: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[1].value, false],
            },
        ],
    },
    {
        name: "To Base32 Standard: " + STANDARD_INP,
        input: STANDARD_INP,
        expectedOutput: STANDARD_OUT,
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[0].value],
            },
        ],
    },
    {
        name: "To Base32 Hex Extended: " + EXTENDED_INP,
        input: EXTENDED_INP,
        expectedOutput: EXTENDED_OUT,
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[1].value],
            },
        ],
    },
    {
        name: "From Base32 Standard: " + STANDARD_OUT,
        input: STANDARD_OUT,
        expectedOutput: STANDARD_INP,
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[0].value, false],
            },
        ],
    },
    {
        name: "From Base32 Hex Extended: " + EXTENDED_OUT,
        input: EXTENDED_OUT,
        expectedOutput: EXTENDED_INP,
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[1].value, false],
            },
        ],
    },
    {
        name: "To Base32 Hex Standard: All Bytes",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES_STANDARD_OUT,
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[0].value],
            },
        ],
    },
    {
        name: "To Base32 Hex Extended: All Bytes",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES_EXTENDED_OUT,
        recipeConfig: [
            {
                op: "To Base32",
                args: [ALPHABET_OPTIONS[1].value],
            },
        ],
    },
    {
        name: "From Base32 Hex Standard: All Bytes",
        input: ALL_BYTES_STANDARD_OUT,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[0].value, false],
            },
        ],
    },
    {
        name: "From Base32 Hex Extended: All Bytes",
        input: ALL_BYTES_EXTENDED_OUT,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "From Base32",
                args: [ALPHABET_OPTIONS[1].value, false],
            },
        ],
    },
]);

