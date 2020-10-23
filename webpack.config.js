var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ],
    devServer: {
        contentBase: "./dist"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
}