const { merge } = require('webpack-merge');
const common = require ('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    watchOptions: {
        poll: 3000, // Check for changes every 3 seconds
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/DASHBOARD_TO_REPLACE/, function (
            resource
        ) {
            resource.request = resource.request.replace(
                /DASHBOARD_TO_REPLACE/,
                './pages/dashboard-dev'
            );
        }),
    ],
})