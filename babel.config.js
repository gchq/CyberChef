module.exports = function(api) {
    api.cache.forever();

    return {
        "plugins": [
            ["polyfill-corejs3", {
                "method": "usage-pure",
                "version": require("core-js-pure/package.json").version
            }]
        ],
        "presets": [
            ["@babel/preset-env", {
                "modules": false
            }]
        ],
        "generatorOpts": {
            "importAttributesKeyword": "with"
        }
    };
};
