module.exports = function(api) {
    api.cache.forever();

    return {
        "presets": [
            ["@babel/preset-env", {
                "modules": false,
                "useBuiltIns": "entry",
                "corejs": 3
            }]
        ],
        "plugins": [
            "dynamic-import-node",
            ["@babel/plugin-proposal-import-attributes-to-assertions", { "deprecatedAssertSyntax": true }],
            [
                "babel-plugin-transform-builtin-extend", {
                    "globals": ["Error"]
                }
            ],
            [
                "@babel/plugin-transform-runtime", {
                    "regenerator": true
                }
            ]
        ]
    };
};
