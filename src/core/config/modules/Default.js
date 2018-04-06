import FlowControl from "../../FlowControl.js";
import Arithmetic from "../../operations/Arithmetic.js";
import Base from "../../operations/Base.js";
import Base58 from "../../operations/Base58.js";
import Base64 from "../../operations/Base64.js";
import BCD from "../../operations/BCD.js";
import BitwiseOp from "../../operations/BitwiseOp.js";
import ByteRepr from "../../operations/ByteRepr.js";
import Convert from "../../operations/Convert.js";
import DateTime from "../../operations/DateTime.js";
import Endian from "../../operations/Endian.js";
import Entropy from "../../operations/Entropy.js";
import Filetime from "../../operations/Filetime.js";
import FileType from "../../operations/FileType.js";
import Hexdump from "../../operations/Hexdump.js";
import HTML from "../../operations/HTML.js";
import MAC from "../../operations/MAC.js";
import MorseCode from "../../operations/MorseCode.js";
import MS from "../../operations/MS.js";
import NetBIOS from "../../operations/NetBIOS.js";
import Numberwang from "../../operations/Numberwang.js";
import OS from "../../operations/OS.js";
import OTP from "../../operations/OTP.js";
import PHP from "../../operations/PHP.js";
import QuotedPrintable from "../../operations/QuotedPrintable.js";
import Rotate from "../../operations/Rotate.js";
import SeqUtils from "../../operations/SeqUtils.js";
import StrUtils from "../../operations/StrUtils.js";
import Tidy from "../../operations/Tidy.js";
import Unicode from "../../operations/Unicode.js";
import UUID from "../../operations/UUID.js";
import XKCD from "../../operations/XKCD.js";


/**
 * Default module.
 *
 * The Default module is for operations that are expected to be very commonly used or
 * do not require any libraries. This module is loaded into the app at compile time.
 *
 * Libraries:
 *  - Utils.js
 *  - otp
 *  - crypto
 *  - bignumber.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Default = {
    "To Hexdump":           Hexdump.runTo,
    "From Hexdump":         Hexdump.runFrom,
    "To Hex":               ByteRepr.runToHex,
    "From Hex":             ByteRepr.runFromHex,
    "To Octal":             ByteRepr.runToOct,
    "From Octal":           ByteRepr.runFromOct,
    "To Charcode":          ByteRepr.runToCharcode,
    "From Charcode":        ByteRepr.runFromCharcode,
    "To Decimal":           ByteRepr.runToDecimal,
    "From Decimal":         ByteRepr.runFromDecimal,
    "To Binary":            ByteRepr.runToBinary,
    "From Binary":          ByteRepr.runFromBinary,
    "To Hex Content":       ByteRepr.runToHexContent,
    "From Hex Content":     ByteRepr.runFromHexContent,
    "To Base64":            Base64.runTo,
    "From Base64":          Base64.runFrom,
    "Show Base64 offsets":  Base64.runOffsets,
    "To Base32":            Base64.runTo32,
    "From Base32":          Base64.runFrom32,
    "To Base58":            Base58.runTo,
    "From Base58":          Base58.runFrom,
    "To Base":              Base.runTo,
    "From Base":            Base.runFrom,
    "To BCD":               BCD.runToBCD,
    "From BCD":             BCD.runFromBCD,
    "To HTML Entity":       HTML.runToEntity,
    "From HTML Entity":     HTML.runFromEntity,
    "Strip HTML tags":      HTML.runStripTags,
    "Parse colour code":    HTML.runParseColourCode,
    "Unescape Unicode Characters": Unicode.runUnescape,
    "To Quoted Printable":  QuotedPrintable.runTo,
    "From Quoted Printable": QuotedPrintable.runFrom,
    "Swap endianness":      Endian.runSwapEndianness,
    "ROT13":                Rotate.runRot13,
    "ROT47":                Rotate.runRot47,
    "Rotate left":          Rotate.runRotl,
    "Rotate right":         Rotate.runRotr,
    "Bit shift left":       BitwiseOp.runBitShiftLeft,
    "Bit shift right":      BitwiseOp.runBitShiftRight,
    "XOR":                  BitwiseOp.runXor,
    "XOR Brute Force":      BitwiseOp.runXorBrute,
    "OR":                   BitwiseOp.runOr,
    "NOT":                  BitwiseOp.runNot,
    "AND":                  BitwiseOp.runAnd,
    "ADD":                  BitwiseOp.runAdd,
    "SUB":                  BitwiseOp.runSub,
    "To Morse Code":        MorseCode.runTo,
    "From Morse Code":      MorseCode.runFrom,
    "Format MAC addresses": MAC.runFormat,
    "Encode NetBIOS Name":  NetBIOS.runEncodeName,
    "Decode NetBIOS Name":  NetBIOS.runDecodeName,
    "Offset checker":       StrUtils.runOffsetChecker,
    "To Upper case":        StrUtils.runUpper,
    "To Lower case":        StrUtils.runLower,
    "Split":                StrUtils.runSplit,
    "Filter":               StrUtils.runFilter,
    "Escape string":        StrUtils.runEscape,
    "Unescape string":      StrUtils.runUnescape,
    "Head":                 StrUtils.runHead,
    "Tail":                 StrUtils.runTail,
    "Hamming Distance":     StrUtils.runHamming,
    "Remove whitespace":    Tidy.runRemoveWhitespace,
    "Remove null bytes":    Tidy.runRemoveNulls,
    "Drop bytes":           Tidy.runDropBytes,
    "Take bytes":           Tidy.runTakeBytes,
    "Pad lines":            Tidy.runPad,
    "Reverse":              SeqUtils.runReverse,
    "Sort":                 SeqUtils.runSort,
    "Unique":               SeqUtils.runUnique,
    "Count occurrences":    SeqUtils.runCount,
    "Add line numbers":     SeqUtils.runAddLineNumbers,
    "Remove line numbers":  SeqUtils.runRemoveLineNumbers,
    "Expand alphabet range": SeqUtils.runExpandAlphRange,
    "Convert distance":     Convert.runDistance,
    "Convert area":         Convert.runArea,
    "Convert mass":         Convert.runMass,
    "Convert speed":        Convert.runSpeed,
    "Convert data units":   Convert.runDataSize,
    "Parse UNIX file permissions": OS.runParseUnixPerms,
    "Parse DateTime":       DateTime.runParse,
    "Translate DateTime Format": DateTime.runTranslateFormat,
    "From UNIX Timestamp":  DateTime.runFromUnixTimestamp,
    "To UNIX Timestamp":    DateTime.runToUnixTimestamp,
    "Sleep":                DateTime.runSleep,
    "Microsoft Script Decoder": MS.runDecodeScript,
    "Entropy":              Entropy.runEntropy,
    "Frequency distribution": Entropy.runFreqDistrib,
    "Chi Square":           Entropy.runChiSq,
    "Detect File Type":     FileType.runDetect,
    "Scan for Embedded Files": FileType.runScanForEmbeddedFiles,
    "Generate UUID":        UUID.runGenerateV4,
    "Numberwang":           Numberwang.run,
    "Generate TOTP":        OTP.runTOTP,
    "Generate HOTP":        OTP.runHOTP,
    "Fork":                 FlowControl.runFork,
    "Merge":                FlowControl.runMerge,
    "Register":             FlowControl.runRegister,
    "Label":                FlowControl.runComment,
    "Jump":                 FlowControl.runJump,
    "Conditional Jump":     FlowControl.runCondJump,
    "Return":               FlowControl.runReturn,
    "Comment":              FlowControl.runComment,
    "PHP Deserialize":      PHP.runDeserialize,
    "Sum":                  Arithmetic.runSum,
    "Subtract":             Arithmetic.runSub,
    "Multiply":             Arithmetic.runMulti,
    "Divide":               Arithmetic.runDiv,
    "Mean":                 Arithmetic.runMean,
    "Median":               Arithmetic.runMedian,
    "Standard Deviation":   Arithmetic.runStdDev,
    "Windows Filetime to UNIX Timestamp": Filetime.runFromFiletimeToUnix,
    "UNIX Timestamp to Windows Filetime": Filetime.runToFiletimeFromUnix,
    "XKCD Random Number":  XKCD.runRandomNumber,


    /*
        Highlighting functions.

        This is a temporary solution as highlighting should be entirely
        overhauled at some point.
    */
    "From Base64-highlight":          Base64.highlightFrom,
    "From Base64-highlightReverse":   Base64.highlightTo,
    "To Base64-highlight":            Base64.highlightTo,
    "To Base64-highlightReverse":     Base64.highlightFrom,
    "From Hex-highlight":             ByteRepr.highlightFrom,
    "From Hex-highlightReverse":      ByteRepr.highlightTo,
    "To Hex-highlight":               ByteRepr.highlightTo,
    "To Hex-highlightReverse":        ByteRepr.highlightFrom,
    "From Charcode-highlight":        ByteRepr.highlightFrom,
    "From Charcode-highlightReverse": ByteRepr.highlightTo,
    "To Charcode-highlight":          ByteRepr.highlightTo,
    "To Charcode-highlightReverse":   ByteRepr.highlightFrom,
    "From Binary-highlight":          ByteRepr.highlightFromBinary,
    "From Binary-highlightReverse":   ByteRepr.highlightToBinary,
    "To Binary-highlight":            ByteRepr.highlightToBinary,
    "To Binary-highlightReverse":     ByteRepr.highlightFromBinary,
    "From Hexdump-highlight":         Hexdump.highlightFrom,
    "From Hexdump-highlightReverse":  Hexdump.highlightTo,
    "To Hexdump-highlight":           Hexdump.highlightTo,
    "To Hexdump-highlightReverse":    Hexdump.highlightFrom,
};

export default OpModules;
