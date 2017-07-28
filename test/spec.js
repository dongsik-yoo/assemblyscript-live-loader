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
            callback: function(err, out) {
                expect(err).toBe(null);
                expect(out.length).not.toBe(0);
                expect(out).toMatch(/module.exports = WebAssemblyModule;/);
            }
        };
        var buffer;
        spyOn(loaderContext, 'callback');

        buffer = loader.call(loaderContext, source);
        expect(loaderContext.callback).toHaveBeenCalled();
        expect(buffer).toBeUndefined();
    });
});
