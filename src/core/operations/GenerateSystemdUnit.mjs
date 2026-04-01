/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

const RESTART_OPTIONS = ["no", "on-sucess", "on-failure", "on-abnormal", "on-watchdog", "on-abort", "always"];
const TYPE_OPTIONS = ["simple", "exec", "forking", "oneshot", "dbus", "notify", "idle"];

/**
 * GenerateSystemdUnit operation
 */
class GenerateSystemdUnit extends Operation {

    /**
     * GenerateSystemdUnit constructor
     */
    constructor() {
        super();

        this.name = "Generate Systemd Unit";
        this.module = "Default";
        this.description = "Generates a systemd unit file based on provided inputs";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Description",
                "type": "string",
                "value": "",
            },
            {
                "name": "After",
                "type": "string",
                "value": "network.target",
            },
            {
                "name": "Wants",
                "type": "string",
                "value": "network-online.target",
            },
            {
                "name": "Restart",
                "type": "option",
                "value": RESTART_OPTIONS,
            },
            {
                "name": "Type",
                "type": "option",
                "value": TYPE_OPTIONS,
            },
            {
                "name": "ExecStart",
                "type": "string",
                "value": "",
            },
            {
                "name": "Environment",
                "type": "string",
                "value": "KEY=VALUE",
            },
            {
                "name": "User",
                "type": "string",
                "value": "",
            },
            {
                "name": "WorkingDirectory",
                "type": "string",
                "value": "",
            },
            {
                "name": "WantedBy",
                "type": "string",
                "value": "multi-user.target",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(_, args) {
        const description = args[0];
        const after = args[1];
        const wants = args[2];
        const restart = args[3];
        const type = args[4];
        const execStart = args[5];
        const environment = args[6];
        const user = args[7];
        const workingDirectory = args[8];
        const wantedBy = args[9];

        const lines = [];

        // [Unit] section
        lines.push("[Unit]");
        if (description) lines.push(`Description=${description}`);
        if (after) lines.push(`After=${after}`);
        if (wants) lines.push(`Wants=${wants}`);

        // [Service] section
        lines.push("");
        lines.push("[Service]");
        if (restart) lines.push(`Restart=${restart}`);
        if (type) lines.push(`Type=${type}`);
        if (execStart) lines.push(`ExecStart=${execStart}`);
        if (environment) lines.push(`Environment=${environment}`);
        if (user) lines.push(`User=${user}`);
        if (workingDirectory) lines.push(`WorkingDirectory=${workingDirectory}`);

        // [Install] section
        lines.push("");
        lines.push("[Install]");
        if (wantedBy) lines.push(`WantedBy=${wantedBy}`);

        return lines.join("\n");
    }
}

export default GenerateSystemdUnit;
