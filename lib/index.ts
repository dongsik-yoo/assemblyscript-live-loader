import { Compiler, CompilerTarget, CompilerMemoryModel } from 'assemblyscript';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

const wasmFooterPath: string = __dirname + '/wasmFooter.js';
const wasmFooter: string = fs.readFileSync(wasmFooterPath, 'utf-8');

/**
 * compile assemblyscript to WebAssembly(wasm)
 * @param {string} source - assemblyscript string
 * @returns {Buffer} wasm stream as a Buffer
 */
function compile(source: string): Buffer {
    const module = Compiler.compileString(source, {
        target: CompilerTarget.WASM32,
        memoryModel: CompilerMemoryModel.MALLOC,
        silent: true
    });
    let wasmFile: Uint8Array;

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
function createWasmModule(source: string, wasm: Buffer): string {
    const { length }: {
        length: number
    } = wasm;
    const buffer: Array<number> = [];
    for (let i = 0; i < length; i += 1) {
        buffer.push(wasm[i]);
    }
    const module = 
        `var buffer = new ArrayBuffer(${wasm.length});
        var uint8 = new Uint8Array(buffer);
        uint8.set([${buffer.join(',')}]);
        ${wasmFooter}`;

    return module;
}

/**
 * Creates commonjs module for javascript
 * @param {string} source assemblyscript source
 * @returns {string} module string
 */
function createJsModule(source: string): string {
    const compilerOptions = {
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false
        }
    };
    const transpiled = ts.transpileModule(source, compilerOptions);

    return transpiled.outputText;
}

/**
 * Creates compatible module with Javascript, WebAssembly both
 * @param {string} jsModule - javascript module
 * @param {string} wasmModule - WebAssembly module
 * @example
 * var compatibleModule;
 * if (typeof WebAssembly !== 'undefined') {
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
function createCompatibleModule(jsModule: string, wasmModule: string): string {
    const module: string = `var compatibleModule;
        if (typeof WebAssembly !== 'undefined') {
            ${wasmModule}
            compatibleModule = WebAssemblyModule;
        }
        else {
            ${jsModule}
            compatibleModule = function() {};
            compatibleModule.prototype.exports = exports;
        }
        module.exports = compatibleModule;`;

    return module;
}

/**
 * Webpack loader for assemblyscript to transform wasm and bundle it
 * @param {string} source - assemblyscript source file
 * @returns {string} module string
 */
function AssemblyScriptLiveLoader(source: string): string {
    let jsModule: string;
    let wasmModule: string;

    if (this.cacheable) {
        this.cacheable();
    }

    this.addDependency(wasmFooterPath);

    jsModule = createJsModule(source);
    wasmModule = createWasmModule(source, compile(source));

    return createCompatibleModule(jsModule, wasmModule);
}

export default AssemblyScriptLiveLoader;
