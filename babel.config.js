module.exports = function(api) {
    api.cache.forever();

    return {
        "presets": [
            ["@babel/preset-env", {
                "modules": false,
                "useBuiltIns": "usage",
                "corejs": 3
            }]
        ],
        "plugins": [
            "@babel/plugin-syntax-import-assertions"
        ]
    };
};
