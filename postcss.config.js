module.exports = {
    plugins: [
        require("postcss-import"),
        require("autoprefixer")({
            browsers: [
                "Chrome >= 40",
                "Firefox >= 35",
                "Edge >= 14"
            ]
        }),
        require("postcss-css-variables")({
            preserve: true
        }),
    ]
};
