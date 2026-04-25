/**
 * Analyse UUID tests
 *
 * @author ko80240 [csk.dev@proton.me]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Analyse UUID: v1 UUID extracts timestamp, clock, and node",
        "input": "cefa1760-28ee-11f1-9f95-1fb76af3e239",
        "expectedOutput": "Version:\n1\n\nTimestamp:\n1774514156502\n\nTimestamp (ISO):\n2026-03-26T08:35:56.502Z\n\nNode:\n1F:B7:6A:F3:E2:39\n\nClock:\n8085\n\nUUID Integer:\n275119515460318071558429785403790975545",
        "recipeConfig": [
            {
                "op": "Analyse UUID",
                "args": [true]
            }
        ]
    },
    {
        "name": "Analyse UUID: v7 UUID extracts timestamp, randA, and randB",
        "input": "019d294a-af64-7728-9524-26da08f50708",
        "expectedOutput": "Version:\n7\n\nTimestamp:\n1774514253668\n\nTimestamp (ISO):\n2026-03-26T08:37:33.668Z\n\nRand A:\n1832\n\nRand B:\n952426DA08F50708\n\nUUID Integer:\n2145256098533991595556290452700595976",
        "recipeConfig": [
            {
                "op": "Analyse UUID",
                "args": [true]
            }
        ]
    },
    {
        "name": "Analyse UUID: v4 UUID should show no metadata - not possible",
        "input": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "expectedOutput": "Version:\n4\n\nNo metadata available. Only versions 1, 6, 7 are supported.\n\nUUID Integer:\n324969006592305634633390616021200786553",
        "recipeConfig": [
            {
                "op": "Analyse UUID",
                "args": [true]
            }
        ]
    },
    {
        "name": "Analyse UUID: if the 'Include Metadata' option is false it should return not metadata",
        "input": "cefa1760-28ee-11f1-9f95-1fb76af3e239",
        "expectedOutput": "Version:\n1\n\nUUID Integer:\n275119515460318071558429785403790975545",
        "recipeConfig": [
            {
                "op": "Analyse UUID",
                "args": [false]
            }
        ]
    },
    {
        "name": "Analyse UUID: invalid UUID should return error message",
        "input": "not-a-uuid",
        "expectedOutput": "Invalid UUID",
        "recipeConfig": [
            {
                "op": "Analyse UUID",
                "args": [true]
            }
        ]
    }
]);
