const path = require("path");

module.exports = {
    entry: {
        js: './src/jbvalidator.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'jbvalidator.min.js'
    },
};
