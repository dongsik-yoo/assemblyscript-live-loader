# assemblyscript-live-loader
Webpack loader to bundle assemblyscript file as WebAssembly

## Installation
```
npm install --save-dev https://github.com/dongsik-yoo/assemblyscript-live-loader.git
```

## Config
Add a webpack loader configuration into webpack.config.js
```js
module: {
    loaders: [
        {
            test: /\.asc$/,       // your assemblyscript file extension
            exclude: 'node_modules/',
            loader: 'assembly-script-loader'
        }
    ]
}
```

## Example
Calculaor.asc will be transformed to **wasm** and **WebAssembly.Module**.
You can use it in javascript
```ts
export function add(a: int, b: int): int {
    return a + b;
}

export function subtract(a: int, b: int): int {
    return a - b;
}

export function multiply(a: int, b: int): int {
    return a * b;
}

export function divide(a: int, b: int): int {
    return a / b;
}
```

index.js
```js
// Calculator is WebAssembly module
import Calculator from './asc/Calculator.asc';

const calculator = new Calculator().exports;
const add = calc.add(44, 8832);
const subtract = calc.subtract(100, 20);
const multiply = calc.multiply(13, 4);
const divide = calc.divide(20, 4);

console.log(add);
console.log(subtract);
console.log(multiply);
console.log(divide);
```

## Uses
* [eslint-config-tui](https://www.npmjs.com/package/eslint-config-tui)
```js
module.exports = {
    extends: 'tui'
};
```

## Dependencies
* [assemblyscript](https://github.com/dcodeIO/AssemblyScript)
* [wasm-loader](https://github.com/dcodeIO/AssemblyScript)