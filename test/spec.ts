import * as fs from 'fs';
import * as path from 'path';
import loader from '../lib';

interface LOADER_CONTEXT {
    addDependency: (dependency: string) => any
}

describe('assemblyscript', function() {
    const sourceFile = path.resolve('./test/source.js');
    let source: string;

    beforeAll(function() {
        source = fs.readFileSync(sourceFile, 'utf-8');
    });

    it('assemblyscript file can be compiled to WebAssembly and call functions', function() {
        const loaderContext: LOADER_CONTEXT = {
            addDependency: function() {}
        };
        let module: string;
        spyOn(loaderContext, 'addDependency');

        module = loader.call(loaderContext, source);
        expect(loaderContext.addDependency).toHaveBeenCalled();
        expect(module).toBeDefined();
        expect(module.length).not.toBe(0);
        expect(module).toMatch(/module.exports = compatibleModule;/);
    });
});
