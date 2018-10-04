const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/src/index.html',
    filename: 'index.html',
});


module.exports = {
    entry: __dirname + '/src/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {	presets: ['es2015'] }
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(png|svg|jpg|gif|eot|ttf|woff|otf|woff2)$/,
                use: ['file-loader']
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: __dirname + '/build',
    },
    
    plugins: [
        HTMLWebpackPluginConfig
        , new ExtractTextPlugin({
            filename: (getPath) => {
                return getPath('app.css').replace('/', 'css');
            },
            allChunks: true
        })
    ]
};