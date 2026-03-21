/**
 * Parse Ethernet frame tests.
 *
 * @author tedk [tedk@ted.do]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse plain Ethernet frame",
        input: "000000000000ffffffffffff08004500",
        expectedOutput: "Source MAC: ff:ff:ff:ff:ff:ff\nDestination MAC: 00:00:00:00:00:00\nData:\n45 00",
        recipeConfig: [
            {
                "op": "Parse Ethernet frame",
                "args": ["Hex", "Text output"]
            }
        ]
    },
    // Example PCAP data from: https://packetlife.net/captures/protocol/vlan/
    {
        name: "Parse Ethernet frame with one VLAN tag (802.1q)",
        input: "01000ccdcdd00013c3dfae188100a0760165aaaa",
        expectedOutput: "Source MAC: 00:13:c3:df:ae:18\nDestination MAC: 01:00:0c:cd:cd:d0\nVLAN: 117\nData:\naa aa",
        recipeConfig: [
            {
                "op": "Parse Ethernet frame",
                "args": ["Hex", "Text output"]
            }
        ]
    },
    {
        name: "Parse Ethernet frame with two VLAN tags (802.1ad)",
        input: "0019aa7de688002155c8f13c810000d18100001408004500",
        expectedOutput: "Source MAC: 00:21:55:c8:f1:3c\nDestination MAC: 00:19:aa:7d:e6:88\nVLAN: 16, 128\nData:\n45 00",
        recipeConfig: [
            {
                "op": "Parse Ethernet frame",
                "args": ["Hex", "Text output"]
            }
        ]
    }
]);
