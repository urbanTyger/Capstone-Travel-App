const { path } = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/client/index.js',
    output: {
        libraryTarget: 'var',
        library: 'Client',
        assetModuleFilename: 'images/[contenthash][ext]',
        publicPath: "",
    },
    module: {
        rules: [

            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                use: ['html-loader'],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: './icons/weather/[name][ext]'
                },
            },
        ],
    },

    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/client/views/index.html",
            filename: "./index.html",
            favicon: "./src/client/views/logo.svg",
            title: "Progressive Web Application",
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/client/views/icons/weather", to: "icons/weather" },
                { from: "src/client/views/logo.svg", to: "icons/" },
            ],
        }),
    ]
}
