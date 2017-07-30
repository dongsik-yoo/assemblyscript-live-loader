module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/public/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.asc$/,
                exclude: '/node_modules/',
                loader: 'assemblyscript-live-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: __dirname + '/public/'
    }
};