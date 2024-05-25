const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

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
        alias: {
            "@primitives": path.resolve(__dirname, './components/lib/primitives'),
            "@ui": path.resolve(__dirname, './components/lib/ui'),
            "@store": path.resolve(__dirname, './store'),
            "@components": path.resolve(__dirname, './components'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        plugins: ['@babel/plugin-transform-object-assign'],
                    },
                },
            },
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
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
        new webpack.EnvironmentPlugin(['WEBSITE_URL']),
        new webpack.ProvidePlugin({
            React: 'react',
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: './public/static', to: __dirname + '/build' }],
        }),
    ],
};
