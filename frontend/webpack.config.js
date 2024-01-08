const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env = {
    entry: {
        index: './index.js',
    },
    output: {
        path: __dirname + '/build',
        filename: 'index.bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx', '.tsx', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-transform-object-assign'],
                    },
                },
            },
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.js$/,
                loader: 'webpack-remove-debug',
            },
            {
                test: /\.(jpg|png)$/,
                use: {
                    loader: 'url-loader',
                },
            },
        ],
    },
    plugins: [
        new HTMLWebpackPlugin({ template: './public/index.html' }),
        new webpack.EnvironmentPlugin(['API_URL']),
        new webpack.ProvidePlugin({
            React: 'react',
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: './public/static', to: __dirname + '/build' }],
        }),
        new webpack.NormalModuleReplacementPlugin(/DASHBOARD_TO_REPLACE/, function (
            resource
        ) {
            if (process.env.BUILD === 'prod') {
                resource.request = resource.request.replace(
                    /DASHBOARD_TO_REPLACE/,
                    './pages/error-404'
                );
            } else if (process.env.BUILD === 'dev') {
                resource.request = resource.request.replace(
                    /DASHBOARD_TO_REPLACE/,
                    './pages/dashboard-dev'
                );
            } else
                resource.request = resource.request.replace(
                    /DASHBOARD_TO_REPLACE/,
                    './components/INVALID_ENV'
                ); //this will crash the app
        }),
    ],
};
