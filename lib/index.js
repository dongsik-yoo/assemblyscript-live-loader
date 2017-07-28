'use strict';

var loader = require('wasm-loader');
var assemblyscript = require('assemblyscript');
var Compiler = assemblyscript.Compiler;
var CompilerTarget = assemblyscript.CompilerTarget;
var CompilerMemoryModel = assemblyscript.CompilerMemoryModel;

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
 * Webpack loader for assemblyscript to transform wasm and bundle it
 * @param {string} source - assemblyscript source file
 * @returns {Buffer} wasm Buffer
 */
function AssemblyScriptLiveLoader(source) {
    var buffer = compile(source);

    return loader.call(this, buffer);
}

module.exports = AssemblyScriptLiveLoader;
