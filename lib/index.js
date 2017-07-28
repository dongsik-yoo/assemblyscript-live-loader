'use strict';

var fs = require('fs');
var assemblyscript = require('assemblyscript');
var Compiler = assemblyscript.Compiler;
var CompilerTarget = assemblyscript.CompilerTarget;
var CompilerMemoryModel = assemblyscript.CompilerMemoryModel;
var wasmFooter = __dirname + '/wasmFooter.js';
var footer = fs.readFileSync(wasmFooter, 'utf-8');

/**
 * compile assemblyscript to WebAssembly(wasm)
 * @param {string} source - assemblyscript string
 * @returns {Buffer} wasm stream as a Buffer
 */
function compile(source) {
    var module = Compiler.compileString(source, {
        target: CompilerTarget.WASM32,
        memoryModel: CompilerMemoryModel.MALLOC,
        silent: true
    });
    var wasmFile;

    if (!module) {
        throw Error('compilation failed');
    }

    module.optimize();

    if (!module.validate()) {
        throw Error('validation failed');
    }

    wasmFile = module.emitBinary();

    module.dispose();

    return new Buffer(wasmFile);
}

/**
 * 
 * @param {string} source assemblyscript source
 * @param {Buffer} wasm WebAssembly Buffer
 * @returns {string} module string
 */
function createModule(source, wasm) {
    var i = 0;
    var length = wasm.length;
    var module = [];
    var buffer = [];
    module.push('var buffer = new ArrayBuffer(' + wasm.length + ');');
    module.push('var uint8 = new Uint8Array(buffer);');
    module.push('uint8.set([');
    for (; i < length; i += 1) {
        buffer.push(wasm[i]);
    }
    module.push(buffer.join(','));
    module.push(']);');
    module.push(footer);

    return module.join('\n');
}

/**
 * Webpack loader for assemblyscript to transform wasm and bundle it
 * @param {string} source - assemblyscript source file
 * @returns {Buffer} wasm Buffer
 */
function AssemblyScriptLiveLoader(source) {
    if (this.cacheable) {
        this.cacheable();
    }

    this.addDependency(wasmFooter);

    return createModule(source, compile(source));
}

module.exports = AssemblyScriptLiveLoader;
