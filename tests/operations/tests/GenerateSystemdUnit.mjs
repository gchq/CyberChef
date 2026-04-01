/**
 * GenerateSystemdUnit tests.
 *
 * @author 0xff1ce
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate minimal systemd unit with required defaults",
        input: "",
        expectedMatch: /\[Unit\]\nAfter=network\.target\nWants=network-online\.target\n\n\[Service\]\nEnvironment=KEY=VALUE\n\n\[Install\]\nWantedBy=multi-user\.target/,
        recipeConfig: [
            {
                op: "Generate Systemd Unit",
                args: [
                    "",                  // Description
                    "network.target",    // After
                    "network-online.target", // Wants
                    "",                  // Restart
                    "",                  // Type
                    "",                  // ExecStart
                    "KEY=VALUE",         // Environment
                    "",                  // User
                    "",                  // WorkingDirectory
                    "multi-user.target"  // WantedBy
                ]
            },
        ],
    },
    {
        name: "Generate full systemd unit with all fields populated",
        input: "",
        expectedMatch: /\[Unit\]\nDescription=My Service\nAfter=network\.target\nWants=network-online\.target\n\n\[Service\]\nRestart=always\nType=simple\nExecStart=\/usr\/bin\/node app\.js\nEnvironment=NODE_ENV=production\nUser=www-data\nWorkingDirectory=\/var\/www\n\n\[Install\]\nWantedBy=multi-user\.target/,
        recipeConfig: [
            {
                op: "Generate Systemd Unit",
                args: [
                    "My Service",
                    "network.target",
                    "network-online.target",
                    "always",
                    "simple",
                    "/usr/bin/node app.js",
                    "NODE_ENV=production",
                    "www-data",
                    "/var/www",
                    "multi-user.target"
                ]
            },
        ],
    },
    {
        name: "Generate unit without optional Service fields",
        input: "",
        expectedMatch: /\[Unit\]\nDescription=Test\nAfter=network\.target\nWants=network-online\.target\n\n\[Service\]\nEnvironment=KEY=VALUE\n\n\[Install\]\nWantedBy=multi-user\.target/,
        recipeConfig: [
            {
                op: "Generate Systemd Unit",
                args: [
                    "Test",
                    "network.target",
                    "network-online.target",
                    "",     // Restart
                    "",     // Type
                    "",     // ExecStart
                    "KEY=VALUE",
                    "",     // User
                    "",     // WorkingDirectory
                    "multi-user.target"
                ]
            },
        ],
    },
    {
        name: "Generate unit with custom dependencies and install target",
        input: "",
        expectedMatch: /\[Unit\]\nDescription=Custom\nAfter=docker\.service\nWants=network\.target\n\n\[Service\]\nRestart=on-failure\nType=exec\nExecStart=\/bin\/bash start\.sh\nEnvironment=ENV=dev\n\n\[Install\]\nWantedBy=graphical\.target/,
        recipeConfig: [
            {
                op: "Generate Systemd Unit",
                args: [
                    "Custom",
                    "docker.service",
                    "network.target",
                    "on-failure",
                    "exec",
                    "/bin/bash start.sh",
                    "ENV=dev",
                    "",     // User
                    "",     // WorkingDirectory
                    "graphical.target"
                ]
            },
        ],
    }
]);
