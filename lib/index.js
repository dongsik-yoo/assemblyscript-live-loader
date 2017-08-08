'use strict';

var fs = require('fs');
var ts = require('typescript');
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
 * Create a module using WebAssembly.Module
 * @param {string} source assemblyscript source
 * @param {Buffer} wasm WebAssembly Buffer
 * @returns {string} module string
 */
function createWasmModule(source, wasm) {
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
 * Creates commonjs module for javascript
 * @param {string} source assemblyscript source
 * @returns {string} module string
 */
function createJsModule(source) {
    var compilerOptions = {
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false
        }
    };
    var transpiled = ts.transpileModule(source, compilerOptions);

    return transpiled.outputText;
}

/**
 * Creates compatible module with Javascript, WebAssembly both
 * @param {string} jsModule - javascript module
 * @param {string} wasmModule - WebAssembly module
 * @example
 * var compatibleModule;
 * if (typeof WebAssembly !== "undefined") {
 *     // ... wasmModule ...
 *     compatibleModule = WebAssemblyModule;
 * }
 * else {
 *     // .. jsModule ...
 *     compatibleModule = function() {};
 *     compatibleModule.prototype.exports = exports;
 * }
 * module.exports = comptaibleModule;
 * @returns {string} module string
 */
function createCompatibleModule(jsModule, wasmModule) {
    var module = 'var compatibleModule;\n';
    module += 'if (typeof WebAssembly !== "undefined") {\n';
    module += wasmModule;
    module += 'compatibleModule = WebAssemblyModule;\n';
    module += '}\n';
    module += 'else {\n';
    module += jsModule;
    module += '\n';
    module += 'compatibleModule = function() {}\n';
    module += 'compatibleModule.prototype.exports = exports;\n';
    module += '}\n';
    module += 'module.exports = compatibleModule;';

    return module;
}

/**
 * Webpack loader for assemblyscript to transform wasm and bundle it
 * @param {string} source - assemblyscript source file
 * @returns {string} module string
 */
function AssemblyScriptLiveLoader(source) {
    var jsModule;
    var wasmModule;

    if (this.cacheable) {
        this.cacheable();
    }

    this.addDependency(wasmFooter);

    jsModule = createJsModule(source);
    wasmModule = createWasmModule(source, compile(source));

    return createCompatibleModule(jsModule, wasmModule);
}

module.exports = AssemblyScriptLiveLoader;
