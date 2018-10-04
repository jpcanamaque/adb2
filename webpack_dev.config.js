const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const webpack = require('webpack');

module.exports  = merge(common, {
    watch: true,
    devServer: {
        host: "localhost",
        port: 3000,
        inline: true,
        historyApiFallback: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
    ]
});