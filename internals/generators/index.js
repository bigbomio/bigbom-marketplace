/**
 * generator/index.js
 *
 * Exports the generators so plop knows them
 */

const fs = require('fs');
const path = require('path');
const languageGenerator = require('./language/index.js');

module.exports = plop => {
    plop.setGenerator('language', languageGenerator);
    plop.addHelper('directory', comp => {
        try {
            fs.accessSync(path.join(__dirname, `../../src/components/${comp}`), fs.F_OK);
            return `components/${comp}`;
        } catch (e) {
            return `containers/${comp}`;
        }
    });
    plop.addHelper('curly', (object, open) => (open ? '{' : '}'));
};
