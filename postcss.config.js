module.exports = {
    plugins: [
        require("postcss-import"),
        require("autoprefixer"),
        require("postcss-css-variables")({
            preserve: true
        }),
    ]
};
