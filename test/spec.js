'use strict';

var fs = require('fs');
var path = require('path');
var loader = require('../lib');

describe('assemblyscript', function() {
    var sourceFile = path.resolve('./test/source.js');
    var source;

    beforeAll(function() {
        source = fs.readFileSync(sourceFile, 'utf-8');
    });

    it('assemblyscript file can be compiled to WebAssembly and call functions', function() {
        var loaderContext = {
            addDependency: function() {}
        };
        var module;
        spyOn(loaderContext, 'addDependency');

        module = loader.call(loaderContext, source);
        expect(loaderContext.addDependency).toHaveBeenCalled();
        expect(module).toBeDefined();
        expect(module.length).not.toBe(0);
        expect(module).toMatch(/module.exports = WebAssemblyModule;/);
    });
});
