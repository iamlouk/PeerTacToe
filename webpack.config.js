const path = require('path');

module.exports = {
    entry: {
        multiplayer: './client/src/index.js',
        singleplayer: './client/src/singleplayer/index.js'
    },
    output: {
        path: path.resolve(__dirname, './client/pub/'),
        filename: '[name].bundle.js'
    }
};
