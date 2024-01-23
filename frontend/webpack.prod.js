const { merge } = require('webpack-merge');
const common = require ('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'webpack-remove-debug',
            },
        ],
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/DASHBOARD_TO_REPLACE/, function (
            resource
        ) {
            resource.request = resource.request.replace(
                /DASHBOARD_TO_REPLACE/,
                './pages/error-404'
            );
        })
    ],
})