/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * ELF Info operation
 */
class ELFInfo extends Operation {
    /**
     * ELFInfo constructor
     */
    constructor() {
        super();

        this.name = "ELF Info";
        this.module = "Default";
        this.description =
            "Implements readelf-like functionality. This operation will extract the ELF Header, Program Headers, Section Headers and Symbol Table for an ELF file.";
        this.infoURL =
            "https://www.wikipedia.org/wiki/Executable_and_Linkable_Format";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let phoff = 0;
        let phEntries = 0;
        let shoff = 0;
        let shEntries = 0;
        let shentSize = 0;
        let entry = 0;
        let format = 0;
        let endianness = "";
        let shstrtab = 0;

        let namesOffset = 0;

        let symtabOffset = 0;
        let symtabSize = 0;
        let symtabEntSize = 0;

        let strtabOffset = 0;
        const align = 30;

        /**
         * This function reads characters until it hits a null terminator.
         *
         * @param {stream} stream
         * @param {integer} namesOffset
         * @param {integer} nameOffset
         * @returns {string}
         */
        function readString(stream, namesOffset, nameOffset) {
            const preMove = stream.position;
            stream.moveTo(namesOffset + nameOffset);

            const nameResult = stream.readString();
            stream.moveTo(preMove);
            return nameResult;
        }

        /**
         * This function parses and extracts relevant information from the ELF Header.
         *
         * @param {stream} stream
         * @returns {string}
         */
        function elfHeader(stream) {
            /**
             * The ELF Header is comprised of the following structures depending on the binary's format.
             *
             * e_ident     - The Magic Number 0x7F,0x45,0x4c,0x46
             *             - Byte set to 1 or 2 to signify 32-bit or 64-bit format, respectively.
             *             - Byte set to 1 or 2 to signify little of big endianness, respectively.
             *             - Byte set to 1 for the version of ELF.
             *             - Byte identifying the target OS ABI.
             *             - Byte further identifying the OS ABI Version.
             *             - 7 Padding Bytes.
             * e_type      - 2 bytes identifying the object file type.
             * e_machine   - 2 bytes identifying the instruction set architecture.
             * e_version   - Byte set to 1 for the version of ELF.
             *
             * 32-bit:
             *      e_entry     - 4 Bytes specifying the entry point.
             *      e_phoff     - 4 Bytes specifying the offset of the Program Header Table.
             *      e_shoff     - 4 Bytes specifying the offset of the Section Header Table.
             *
             * 64-bit:
             *      e_entry     - 8 Bytes specifying the entry point.
             *      e_phoff     - 8 Bytes specifying the offset of the Program Header Table.
             *      e_shoff     - 8 Bytes specifying the offset of the Section Header Table.
             *
             * e_flags     - 4 Bytes specifying processor specific flags.
             * e_ehsize    - 2 Bytes specifying the size of the ELF Header.
             * e_phentsize - 2 Bytes specifying the size of a Program Header Table Entry.
             * e_phnum     - 2 Bytes specifying the number of entries in the Program Header Table.
             * e_shentsize - 2 Bytes specifying the size of a Section Header Table Entry.
             * e_shnum     - 2 Bytes specifying the number of entries in the Section Header Table.
             * e_shstrndx  - 2 Bytes specifying the index of the section containing the section names in the Section Header Table.
             */
            const ehResult = [];

            const magic = stream.getBytes(4);
            if (magic.join("") !== [0x7f, 0x45, 0x4c, 0x46].join(""))
                throw new OperationError("Invalid ELF");

            ehResult.push(
                "Magic:".padEnd(align) + `${Utils.byteArrayToChars(magic)}`,
            );

            format = stream.readInt(1);
            ehResult.push(
                "Format:".padEnd(align) +
                    `${format === 1 ? "32-bit" : "64-bit"}`,
            );

            endianness = stream.readInt(1) === 1 ? "le" : "be";
            ehResult.push(
                "Endianness:".padEnd(align) +
                    `${endianness === "le" ? "Little" : "Big"}`,
            );

            ehResult.push(
                "Version:".padEnd(align) + `${stream.readInt(1).toString()}`,
            );

            let ABI = "";
            switch (stream.readInt(1)) {
                case 0x00:
                    ABI = "System V";
                    break;
                case 0x01:
                    ABI = "HP-UX";
                    break;
                case 0x02:
                    ABI = "NetBSD";
                    break;
                case 0x03:
                    ABI = "Linux";
                    break;
                case 0x04:
                    ABI = "GNU Hurd";
                    break;
                case 0x06:
                    ABI = "Solaris";
                    break;
                case 0x07:
                    ABI = "AIX";
                    break;
                case 0x08:
                    ABI = "IRIX";
                    break;
                case 0x09:
                    ABI = "FreeBSD";
                    break;
                case 0x0a:
                    ABI = "Tru64";
                    break;
                case 0x0b:
                    ABI = "Novell Modesto";
                    break;
                case 0x0c:
                    ABI = "OpenBSD";
                    break;
                case 0x0d:
                    ABI = "OpenVMS";
                    break;
                case 0x0e:
                    ABI = "NonStop Kernel";
                    break;
                case 0x0f:
                    ABI = "AROS";
                    break;
                case 0x10:
                    ABI = "Fenix OS";
                    break;
                case 0x11:
                    ABI = "CloudABI";
                    break;
                case 0x12:
                    ABI = "Stratus Technologies OpenVOS";
                    break;
                default:
                    break;
            }
            ehResult.push("ABI:".padEnd(align) + ABI);

            // Linux Kernel does not use ABI Version.
            const abiVersion = stream.readInt(1).toString();
            if (ABI !== "Linux")
                ehResult.push("ABI Version:".padEnd(align) + abiVersion);

            stream.moveForwardsBy(7);

            let eType = "";
            switch (stream.readInt(2, endianness)) {
                case 0x0000:
                    eType = "Unknown";
                    break;
                case 0x0001:
                    eType = "Relocatable File";
                    break;
                case 0x0002:
                    eType = "Executable File";
                    break;
                case 0x0003:
                    eType = "Shared Object";
                    break;
                case 0x0004:
                    eType = "Core File";
                    break;
                case 0xfe00:
                    eType = "LOOS";
                    break;
                case 0xfeff:
                    eType = "HIOS";
                    break;
                case 0xff00:
                    eType = "LOPROC";
                    break;
                case 0xffff:
                    eType = "HIPROC";
                    break;
                default:
                    break;
            }
            ehResult.push("Type:".padEnd(align) + eType);

            let ISA = "";
            switch (stream.readInt(2, endianness)) {
                case 0x0000:
                    ISA = "No specific instruction set";
                    break;
                case 0x0001:
                    ISA = "AT&T WE 32100";
                    break;
                case 0x0002:
                    ISA = "SPARC";
                    break;
                case 0x0003:
                    ISA = "x86";
                    break;
                case 0x0004:
                    ISA = "Motorola 68000 (M68k)";
                    break;
                case 0x0005:
                    ISA = "Motorola 88000 (M88k)";
                    break;
                case 0x0006:
                    ISA = "Intel MCU";
                    break;
                case 0x0007:
                    ISA = "Intel 80860";
                    break;
                case 0x0008:
                    ISA = "MIPS";
                    break;
                case 0x0009:
                    ISA = "IBM System/370";
                    break;
                case 0x000a:
                    ISA = "MIPS RS3000 Little-endian";
                    break;
                case 0x000b:
                case 0x000c:
                case 0x000d:
                case 0x000e:
                case 0x0018:
                case 0x0019:
                case 0x001a:
                case 0x001b:
                case 0x001c:
                case 0x001d:
                case 0x001e:
                case 0x001f:
                case 0x0020:
                case 0x0021:
                case 0x0022:
                case 0x0023:
                    ISA = "Reserved for future use";
                    break;
                case 0x000f:
                    ISA = "Hewlett-Packard PA-RISC";
                    break;
                case 0x0011:
                    ISA = "Fujitsu VPP500";
                    break;
                case 0x0012:
                    ISA = "Enhanced instruction set SPARC";
                    break;
                case 0x0013:
                    ISA = "Intel 80960";
                    break;
                case 0x0014:
                    ISA = "PowerPC";
                    break;
                case 0x0015:
                    ISA = "PowerPC (64-bit)";
                    break;
                case 0x0016:
                    ISA = "S390, including S390";
                    break;
                case 0x0017:
                    ISA = "IBM SPU/SPC";
                    break;
                case 0x0024:
                    ISA = "NEC V800";
                    break;
                case 0x0025:
                    ISA = "Fujitsu FR20";
                    break;
                case 0x0026:
                    ISA = "TRW RH-32";
                    break;
                case 0x0027:
                    ISA = "Motorola RCE";
                    break;
                case 0x0028:
                    ISA = "ARM (up to ARMv7/Aarch32)";
                    break;
                case 0x0029:
                    ISA = "Digital Alpha";
                    break;
                case 0x002a:
                    ISA = "SuperH";
                    break;
                case 0x002b:
                    ISA = "SPARC Version 9";
                    break;
                case 0x002c:
                    ISA = "Siemens TriCore embedded processor";
                    break;
                case 0x002d:
                    ISA = "Argonaut RISC Core";
                    break;
                case 0x002e:
                    ISA = "Hitachi H8/300";
                    break;
                case 0x002f:
                    ISA = "Hitachi H8/300H";
                    break;
                case 0x0030:
                    ISA = "Hitachi H8S";
                    break;
                case 0x0031:
                    ISA = "Hitachi H8/500";
                    break;
                case 0x0032:
                    ISA = "IA-64";
                    break;
                case 0x0033:
                    ISA = "Standford MIPS-X";
                    break;
                case 0x0034:
                    ISA = "Motorola ColdFire";
                    break;
                case 0x0035:
                    ISA = "Motorola M68HC12";
                    break;
                case 0x0036:
                    ISA = "Fujitsu MMA Multimedia Accelerator";
                    break;
                case 0x0037:
                    ISA = "Siemens PCP";
                    break;
                case 0x0038:
                    ISA = "Sony nCPU embedded RISC processor";
                    break;
                case 0x0039:
                    ISA = "Denso NDR1 microprocessor";
                    break;
                case 0x003a:
                    ISA = "Motorola Star*Core processor";
                    break;
                case 0x003b:
                    ISA = "Toyota ME16 processor";
                    break;
                case 0x003c:
                    ISA = "STMicroelectronics ST100 processor";
                    break;
                case 0x003d:
                    ISA =
                        "Advanced Logic Corp. TinyJ embedded processor family";
                    break;
                case 0x003e:
                    ISA = "AMD x86-64";
                    break;
                case 0x003f:
                    ISA = "Sony DSP Processor";
                    break;
                case 0x0040:
                    ISA = "Digital Equipment Corp. PDP-10";
                    break;
                case 0x0041:
                    ISA = "Digital Equipment Corp. PDP-11";
                    break;
                case 0x0042:
                    ISA = "Siemens FX66 microcontroller";
                    break;
                case 0x0043:
                    ISA = "STMicroelectronics ST9+ 8/16 bit microcontroller";
                    break;
                case 0x0044:
                    ISA = "STMicroelectronics ST7 8-bit microcontroller";
                    break;
                case 0x0045:
                    ISA = "Motorola MC68HC16 Microcontroller";
                    break;
                case 0x0046:
                    ISA = "Motorola MC68HC11 Microcontroller";
                    break;
                case 0x0047:
                    ISA = "Motorola MC68HC08 Microcontroller";
                    break;
                case 0x0048:
                    ISA = "Motorola MC68HC05 Microcontroller";
                    break;
                case 0x0049:
                    ISA = "Silicon Graphics SVx";
                    break;
                case 0x004a:
                    ISA = "STMicroelectronics ST19 8-bit microcontroller";
                    break;
                case 0x004b:
                    ISA = "Digital VAX";
                    break;
                case 0x004c:
                    ISA = "Axis Communications 32-bit embedded processor";
                    break;
                case 0x004d:
                    ISA = "Infineon Technologies 32-bit embedded processor";
                    break;
                case 0x004e:
                    ISA = "Element 14 64-bit DSP Processor";
                    break;
                case 0x004f:
                    ISA = "LSI Logic 16-bit DSP Processor";
                    break;
                case 0x0050:
                    ISA = "Donald Knuth's educational 64-bit processor";
                    break;
                case 0x0051:
                    ISA = "Harvard University machine-independent object files";
                    break;
                case 0x0052:
                    ISA = "SiTera Prism";
                    break;
                case 0x0053:
                    ISA = "Atmel AVR 8-bit microcontroller";
                    break;
                case 0x0054:
                    ISA = "Fujitsu FR30";
                    break;
                case 0x0055:
                    ISA = "Mitsubishi D10V";
                    break;
                case 0x0056:
                    ISA = "Mitsubishi D30V";
                    break;
                case 0x0057:
                    ISA = "NEC v850";
                    break;
                case 0x0058:
                    ISA = "Mitsubishi M32R";
                    break;
                case 0x0059:
                    ISA = "Matsushita MN10300";
                    break;
                case 0x005a:
                    ISA = "Matsushita MN10200";
                    break;
                case 0x005b:
                    ISA = "picoJava";
                    break;
                case 0x005c:
                    ISA = "OpenRISC 32-bit embedded processor";
                    break;
                case 0x005d:
                    ISA = "ARC Cores Tangent-A5";
                    break;
                case 0x005e:
                    ISA = "Tensilica Xtensa Architecture";
                    break;
                case 0x005f:
                    ISA = "Alphamosaic VideoCore processor";
                    break;
                case 0x0060:
                    ISA = "Thompson Multimedia General Purpose Processor";
                    break;
                case 0x0061:
                    ISA = "National Semiconductor 32000 series";
                    break;
                case 0x0062:
                    ISA = "Tenor Network TPC processor";
                    break;
                case 0x0063:
                    ISA = "Trebia SNP 1000 processor";
                    break;
                case 0x0064:
                    ISA =
                        "STMicroelectronics (www.st.com) ST200 microcontroller";
                    break;
                case 0x008c:
                    ISA = "TMS320C6000 Family";
                    break;
                case 0x00af:
                    ISA = "MCST Elbrus e2k";
                    break;
                case 0x00b7:
                    ISA = "ARM 64-bits (ARMv8/Aarch64)";
                    break;
                case 0x00f3:
                    ISA = "RISC-V";
                    break;
                case 0x00f7:
                    ISA = "Berkeley Packet Filter";
                    break;
                case 0x0101:
                    ISA = "WDC 65C816";
                    break;
                default:
                    ISA = "Unimplemented";
                    break;
            }
            ehResult.push("Instruction Set Architecture:".padEnd(align) + ISA);

            ehResult.push(
                "ELF Version:".padEnd(align) +
                    `${stream.readInt(4, endianness)}`,
            );

            const readSize = format === 1 ? 4 : 8;
            entry = stream.readInt(readSize, endianness);
            phoff = stream.readInt(readSize, endianness);
            shoff = stream.readInt(readSize, endianness);
            ehResult.push(
                "Entry Point:".padEnd(align) + `0x${Utils.hex(entry)}`,
            );
            ehResult.push(
                "Entry PHOFF:".padEnd(align) + `0x${Utils.hex(phoff)}`,
            );
            ehResult.push(
                "Entry SHOFF:".padEnd(align) + `0x${Utils.hex(shoff)}`,
            );

            const flags = stream.readInt(4, endianness);
            ehResult.push("Flags:".padEnd(align) + `${Utils.bin(flags)}`);

            ehResult.push(
                "ELF Header Size:".padEnd(align) +
                    `${stream.readInt(2, endianness)} bytes`,
            );
            ehResult.push(
                "Program Header Size:".padEnd(align) +
                    `${stream.readInt(2, endianness)} bytes`,
            );
            phEntries = stream.readInt(2, endianness);
            ehResult.push("Program Header Entries:".padEnd(align) + phEntries);
            shentSize = stream.readInt(2, endianness);
            ehResult.push(
                "Section Header Size:".padEnd(align) + shentSize + " bytes",
            );
            shEntries = stream.readInt(2, endianness);
            ehResult.push("Section Header Entries:".padEnd(align) + shEntries);
            shstrtab = stream.readInt(2, endianness);
            ehResult.push("Section Header Names:".padEnd(align) + shstrtab);

            return ehResult.join("\n");
        }

        /**
         * This function parses and extracts relevant information from a Program Header.
         *
         * @param {stream} stream
         * @returns {string}
         */
        function programHeader(stream) {
            /**
             * A Program Header is comprised of the following structures depending on the binary's format.
             *
             * p_type       - 4 Bytes identifying the type of the segment.
             *
             * 32-bit:
             *      p_offset    - 4 Bytes specifying the offset of the segment.
             *      p_vaddr     - 4 Bytes specifying the virtual address of the segment in memory.
             *      p_paddr     - 4 Bytes specifying the physical address of the segment in memory.
             *      p_filesz    - 4 Bytes specifying the size in bytes of the segment in the file image.
             *      p_memsz     - 4 Bytes specifying the size in bytes of the segment in memory.
             *      p_flags     - 4 Bytes identifying the segment dependent flags.
             *      p_align     - 4 Bytes set to 0 or 1 for alignment or no alignment, respectively.
             *
             * 64-bit:
             *      p_flags     - 4 Bytes identifying segment dependent flags.
             *      p_offset    - 8 Bytes specifying the offset of the segment.
             *      p_vaddr     - 8 Bytes specifying the virtual address of the segment in memory.
             *      p_paddr     - 8 Bytes specifying the physical address of the segment in memory.
             *      p_filesz    - 8 Bytes specifying the size in bytes of the segment in the file image.
             *      p_memsz     - 8 Bytes specifying the size in bytes of the segment in memory.
             *      p_align     - 8 Bytes set to 0 or 1 for alignment or no alignment, respectively.
             */

            /**
             * This function decodes the flags bitmask for the Program Header.
             *
             * @param {integer} flags
             * @returns {string}
             */
            function readFlags(flags) {
                const result = [];
                if (flags & 0x1) result.push("Execute");
                if (flags & 0x2) result.push("Write");
                if (flags & 0x4) result.push("Read");
                if (flags & 0xf0000000) result.push("Unspecified");
                return result.join(",");
            }

            const phResult = [];

            let pType = "";
            const programHeaderType = stream.readInt(4, endianness);
            switch (true) {
                case programHeaderType === 0x00000000:
                    pType = "Unused";
                    break;
                case programHeaderType === 0x00000001:
                    pType = "Loadable Segment";
                    break;
                case programHeaderType === 0x00000002:
                    pType = "Dynamic linking information";
                    break;
                case programHeaderType === 0x00000003:
                    pType = "Interpreter Information";
                    break;
                case programHeaderType === 0x00000004:
                    pType = "Auxiliary Information";
                    break;
                case programHeaderType === 0x00000005:
                    pType = "Reserved";
                    break;
                case programHeaderType === 0x00000006:
                    pType = "Program Header Table";
                    break;
                case programHeaderType === 0x00000007:
                    pType = "Thread-Local Storage Template";
                    break;
                case programHeaderType >= 0x60000000 &&
                    programHeaderType <= 0x6fffffff:
                    pType = "Reserved Inclusive Range. OS Specific";
                    break;
                case programHeaderType >= 0x70000000 &&
                    programHeaderType <= 0x7fffffff:
                    pType = "Reserved Inclusive Range. Processor Specific";
                    break;
                default:
                    break;
            }
            phResult.push("Program Header Type:".padEnd(align) + pType);

            if (format === 2)
                phResult.push(
                    "Flags:".padEnd(align) +
                        readFlags(stream.readInt(4, endianness)),
                );

            const readSize = format === 1 ? 4 : 8;
            phResult.push(
                "Offset Of Segment:".padEnd(align) +
                    `${stream.readInt(readSize, endianness)}`,
            );
            phResult.push(
                "Virtual Address of Segment:".padEnd(align) +
                    `${stream.readInt(readSize, endianness)}`,
            );
            phResult.push(
                "Physical Address of Segment:".padEnd(align) +
                    `${stream.readInt(readSize, endianness)}`,
            );
            phResult.push(
                "Size of Segment:".padEnd(align) +
                    `${stream.readInt(readSize, endianness)} bytes`,
            );
            phResult.push(
                "Size of Segment in Memory:".padEnd(align) +
                    `${stream.readInt(readSize, endianness)} bytes`,
            );

            if (format === 1)
                phResult.push(
                    "Flags:".padEnd(align) +
                        readFlags(stream.readInt(4, endianness)),
                );

            stream.moveForwardsBy(readSize);

            return phResult.join("\n");
        }

        /**
         * This function parses and extracts relevant information from a Section Header.
         *
         * @param {stream} stream
         * @returns {string}
         */
        function sectionHeader(stream) {
            /**
             * A Section Header is comprised of the following structures depending on the binary's format.
             *
             * sh_name      - 4 Bytes identifying the offset into the .shstrtab for the name of this section.
             * sh_type      - 4 Bytes identifying the type of this header.
             *
             * 32-bit:
             *      sh_flags        - 4 Bytes identifying section specific flags.
             *      sh_addr         - 4 Bytes identifying the virtual address of the section in memory.
             *      sh_offset       - 4 Bytes identifying the offset of the section in the file.
             *      sh_size         - 4 Bytes specifying the size in bytes of the section in the file image.
             *      sh_link         - 4 Bytes identifying the index of an associated section.
             *      sh_info         - 4 Bytes specifying extra information about the section.
             *      sh_addralign    - 4 Bytes containing the alignment for the section.
             *      sh_entsize      - 4 Bytes specifying the size, in bytes, of each entry in the section.
             *
             * 64-bit:
             *      sh_flags        - 8 Bytes identifying section specific flags.
             *      sh_addr         - 8 Bytes identifying the virtual address of the section in memory.
             *      sh_offset       - 8 Bytes identifying the offset of the section in the file.
             *      sh_size         - 8 Bytes specifying the size in bytes of the section in the file image.
             *      sh_link         - 4 Bytes identifying the index of an associated section.
             *      sh_info         - 4 Bytes specifying extra information about the section.
             *      sh_addralign    - 8 Bytes containing the alignment for the section.
             *      sh_entsize      - 8 Bytes specifying the size, in bytes, of each entry in the section.
             */
            const shResult = [];

            const nameOffset = stream.readInt(4, endianness);
            let type = "";
            const shType = stream.readInt(4, endianness);
            switch (true) {
                case shType === 0x00000001:
                    type = "Program Data";
                    break;
                case shType === 0x00000002:
                    type = "Symbol Table";
                    break;
                case shType === 0x00000003:
                    type = "String Table";
                    break;
                case shType === 0x00000004:
                    type = "Relocation Entries with Addens";
                    break;
                case shType === 0x00000005:
                    type = "Symbol Hash Table";
                    break;
                case shType === 0x00000006:
                    type = "Dynamic Linking Information";
                    break;
                case shType === 0x00000007:
                    type = "Notes";
                    break;
                case shType === 0x00000008:
                    type = "Program Space with No Data";
                    break;
                case shType === 0x00000009:
                    type = "Relocation Entries with no Addens";
                    break;
                case shType === 0x0000000a:
                    type = "Reserved";
                    break;
                case shType === 0x0000000b:
                    type = "Dynamic Linker Symbol Table";
                    break;
                case shType === 0x0000000e:
                    type = "Array of Constructors";
                    break;
                case shType === 0x0000000f:
                    type = "Array of Destructors";
                    break;
                case shType === 0x00000010:
                    type = "Array of pre-constructors";
                    break;
                case shType === 0x00000011:
                    type = "Section group";
                    break;
                case shType === 0x00000012:
                    type = "Extended section indices";
                    break;
                case shType === 0x00000013:
                    type = "Number of defined types";
                    break;
                case shType >= 0x60000000 && shType <= 0x6fffffff:
                    type = "OS-specific";
                    break;
                case shType >= 0x70000000 && shType <= 0x7fffffff:
                    type = "Processor-specific";
                    break;
                case shType >= 0x80000000 && shType <= 0x8fffffff:
                    type = "Application-specific";
                    break;
                default:
                    type = "Unused";
                    break;
            }

            shResult.push("Type:".padEnd(align) + type);

            let nameResult = "";
            if (type !== "Unused") {
                nameResult = readString(stream, namesOffset, nameOffset);
                shResult.push("Section Name: ".padEnd(align) + nameResult);
            }

            const readSize = format === 1 ? 4 : 8;

            const flags = stream.readInt(readSize, endianness);
            const shFlags = [];
            const bitMasks = [
                [0x00000001, "Writable"],
                [0x00000002, "Alloc"],
                [0x00000004, "Executable"],
                [0x00000010, "Merge"],
                [0x00000020, "Strings"],
                [0x00000040, "SHT Info Link"],
                [0x00000080, "Link Order"],
                [0x00000100, "OS Specific Handling"],
                [0x00000200, "Group"],
                [0x00000400, "Thread Local Data"],
                [0x0ff00000, "OS-Specific"],
                [0xf0000000, "Processor Specific"],
                [0x04000000, "Special Ordering (Solaris)"],
                [0x08000000, "Excluded (Solaris)"],
            ];
            bitMasks.forEach((elem) => {
                if (flags & elem[0]) shFlags.push(elem[1]);
            });
            shResult.push("Flags:".padEnd(align) + shFlags);

            const vaddr = stream.readInt(readSize, endianness);
            shResult.push("Section Vaddr in memory:".padEnd(align) + vaddr);

            const shoffset = stream.readInt(readSize, endianness);
            shResult.push("Offset of the section:".padEnd(align) + shoffset);

            const secSize = stream.readInt(readSize, endianness);
            shResult.push("Section Size:".padEnd(align) + secSize);

            const associatedSection = stream.readInt(4, endianness);
            shResult.push(
                "Associated Section:".padEnd(align) + associatedSection,
            );

            const extraInfo = stream.readInt(4, endianness);
            shResult.push(
                "Section Extra Information:".padEnd(align) + extraInfo,
            );

            // Jump over alignment field.
            stream.moveForwardsBy(readSize);
            const entSize = stream.readInt(readSize, endianness);
            switch (nameResult) {
                case ".strtab":
                    strtabOffset = shoffset;
                    break;
                case ".symtab":
                    symtabOffset = shoffset;
                    symtabSize = secSize;
                    symtabEntSize = entSize;
                    break;
                default:
                    break;
            }
            return shResult.join("\n");
        }

        /**
         * This function returns the offset of the Section Header Names Section.
         *
         * @param {stream} stream
         */
        function getNamesOffset(stream) {
            const preMove = stream.position;
            stream.moveTo(shoff + shentSize * shstrtab);
            if (format === 1) {
                stream.moveForwardsBy(0x10);
                namesOffset = stream.readInt(4, endianness);
            } else {
                stream.moveForwardsBy(0x18);
                namesOffset = stream.readInt(8, endianness);
            }
            stream.position = preMove;
        }

        /**
         * This function returns a symbol's name from the string table.
         *
         * @param {stream} stream
         * @returns {string}
         */
        function getSymbols(stream) {
            /**
             * The Symbol Table is comprised of Symbol Table Entries whose structure depends on the binary's format.
             *
             * 32-bit:
             *      st_name         - 4 Bytes specifying an index in the files symbol string table.
             *      st_value        - 4 Bytes identifying the value associated with the symbol.
             *      st_size         - 4 Bytes specifying the size associated with the symbol (this is not the size of the symbol).
             *      st_info         - A byte specifying the type and binding of the symbol.
             *      st_other        - A byte specifying the symbol's visibility.
             *      st_shndx        - 2 Bytes identifying the section that this symbol is related to.
             *
             * 64-bit:
             *      st_name         - 4 Bytes specifying an index in the files symbol string table.
             *      st_info         - A byte specifying the type and binding of the symbol.
             *      st_other        - A byte specifying the symbol's visibility.
             *      st_shndx        - 2 Bytes identifying the section that this symbol is related to.
             *      st_value        - 8 Bytes identifying the value associated with the symbol.
             *      st_size         - 8 Bytes specifying the size associated with the symbol (this is not the size of the symbol).
             */
            const nameOffset = stream.readInt(4, endianness);
            stream.moveForwardsBy(format === 2 ? 20 : 12);
            return readString(stream, strtabOffset, nameOffset);
        }

        input = new Uint8Array(input);
        const stream = new Stream(input);
        const result = ["=".repeat(align) + " ELF Header " + "=".repeat(align)];
        result.push(elfHeader(stream) + "\n");

        getNamesOffset(stream);

        result.push("=".repeat(align) + " Program Header " + "=".repeat(align));
        stream.moveTo(phoff);
        for (let i = 0; i < phEntries; i++)
            result.push(programHeader(stream) + "\n");

        result.push("=".repeat(align) + " Section Header " + "=".repeat(align));
        stream.moveTo(shoff);
        for (let i = 0; i < shEntries; i++)
            result.push(sectionHeader(stream) + "\n");

        result.push("=".repeat(align) + " Symbol Table " + "=".repeat(align));

        stream.moveTo(symtabOffset);
        let elem = "";
        for (let i = 0; i < symtabSize / symtabEntSize; i++)
            if ((elem = getSymbols(stream)) !== "")
                result.push("Symbol Name:".padEnd(align) + elem);

        return result.join("\n");
    }
}

export default ELFInfo;
