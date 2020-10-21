//.mocharc.js
const {colors, symbols} = require('mocha/lib/reporters/base');
colors.pass = 32;

// example config from Mocha repo       
module.exports = {
    diff: true,
    extension: ['ts'],
    package: './package.json',
    reporter: 'spec',
    slow: 75,
    timeout: 2000,
    ui: 'bdd',
    'watch-files': ['src/**/*.ts','test/**/*.ts']
};