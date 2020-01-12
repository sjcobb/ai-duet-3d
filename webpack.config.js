// https://github.com/johndatserakis/modern-webpack-starter/blob/master/webpack.config.js
// https://github.com/edwinwebb/three-seed/blob/master/webpack.config.js 
// https://github.com/webpack/webpack-dev-server/blob/master/examples/api/simple/server.js#L16
// https://medium.com/code-oil/burning-questions-with-answers-to-why-webpack-dev-server-live-reload-does-not-work-6d6390277920
// USE:
// https://github.com/johndatserakis/modern-webpack-starter/blob/master/webpack.config.js
// resolve .js files in path src: https://github.com/johndatserakis/modern-webpack-starter/blob/master/webpack.config.js#L95
// startup command: 
//    NODE_ENV=development webpack-dev-server --open --hot --display-error-details

const path = require('path');

// TODO: include Three.js here instead of in index.html, resolve all in src folder and node_modules to fix GitHub Pages 404s
const config = {
    entry: {
        'bundle.js': [
            path.resolve(__dirname, 'node_modules/stats.js/build/stats.min.js'),
            path.resolve(__dirname, 'node_modules/webmidi/webmidi.min.js'),
            // path.resolve(__dirname, 'node_modules/tonal/build/es6.js'),
            // path.resolve(__dirname, 'node_modules/tone/build/Tone.js'),
            path.resolve(__dirname, 'src/js/Fire.js'),
            path.resolve(__dirname, 'src/js/FireShader.js'),
            path.resolve(__dirname, 'src/js/Store.js'),
            path.resolve(__dirname, 'src/js/Helpers.js'),
            path.resolve(__dirname, 'src/js/Trigger.js'),
            path.resolve(__dirname, 'src/js/Pool.js'),
            path.resolve(__dirname, 'src/js/Threex.js'),
            path.resolve(__dirname, 'src/js/Physics.js'),
            path.resolve(__dirname, 'src/js/drums.js'),
            path.resolve(__dirname, 'src/js/InstrumentMappings.js'),
            path.resolve(__dirname, 'src/js/Flame.js'),
            path.resolve(__dirname, 'src/js/Light.js'),
            path.resolve(__dirname, 'src/js/app.js'),
            path.resolve(__dirname, 'src/js/Audio.js'),
            path.resolve(__dirname, 'src/js/Input.js'),
            path.resolve(__dirname, 'src/js/ui.js')
        ]
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        // host: '0.0.0.0',
        port: 8082,
        // publicPath: '/assets/',
        publicPath: '/dist/',
        watchContentBase: true, //for html
        historyApiFallback: true
    }
};

module.exports = config;