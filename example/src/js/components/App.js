import React from 'react';
import microBenchmark from 'micro-benchmark';
import _ from 'lodash';
import Chart from './Chart';
import CalculatorJS from '../Calculator';
import CalculatorASC from '../../asc/Calculator.asc';
const CalculatorWASM = new CalculatorASC().exports;

const factorialNumber = 1000;
const factorialLoop = 10000;
const N = 1000000;

class App extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            dataInJsLoop: {},
            dataInWasmLoop: {}
        };
    }

    componentDidMount() {
        this.makeSuiteInLoopJs();
        this.makeSuiteInLoopWasm();
        this.startTestInLoopJs().then(this.startTestInLoopWasm());
    }

    makeSuiteInLoopJs() {
        this.specsInLoopJs = {};
        this.specsInLoopJs['Javascript'] = [{
            name: 'Factorial',
            fn: function () {
                var i = 0;
                for (; i < factorialLoop; i += 1) {
                    CalculatorJS.factorial(factorialNumber);
                }
            }
        }, {
            name: 'Add',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorJS.add(10, 20);
                }
            }
        }, {
            name: 'Subtract',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorJS.subtract(30, 10);
                }
            }
        }, {
            name: 'Multiply',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorJS.multiply(15, 12);
                }
            }
        }, {
            name: 'Divide',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorJS.divide(50, 5);
                }
            }
        }];

        this.specsInLoopJs['WebAssembly'] = [{
            name: 'Factorial',
            fn: function () {
                var i = 0;
                for (; i < factorialLoop; i += 1) {
                    CalculatorWASM.factorial(factorialNumber);
                }
            }
        }, {
            name: 'Add',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorWASM.add(10, 20);
                }
            }
        }, {
            name: 'Subtract',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorWASM.subtract(30, 10);
                }
            }
        }, {
            name: 'Multiply',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorWASM.multiply(15, 12);
                }
            }
        }, {
            name: 'Divide',
            fn: function () {
                var i = 0;
                for (; i < N; i += 1) {
                    CalculatorWASM.divide(50, 5);
                }
            }
        }];
    }

    makeSuiteInLoopWasm() {
        this.specsInLoopWasm = {};
        this.specsInLoopWasm['Javascript'] = [{
            name: 'Factorial',
            fn: function () {
                CalculatorJS.factorialWithLoopCount(factorialLoop, factorialNumber);
            }
        }, {
            name: 'Add',
            fn: function () {
                CalculatorJS.addWithLoopCount(N, 10, 20);
            }
        }, {
            name: 'Subtract',
            fn: function () {
                CalculatorJS.subtractWithLoopCount(N, 30, 10);
            }
        }, {
            name: 'Multiply',
            fn: function () {
                CalculatorJS.multiplyWithLoopCount(N, 15, 12);
            }
        }, {
            name: 'Divide',
            fn: function () {
                CalculatorJS.divideWithLoopCount(N, 50, 5);
            }
        }];

        this.specsInLoopWasm['WebAssembly'] = [{
            name: 'Factorial',
            fn: function () {
                CalculatorWASM.factorialWithLoopCount(factorialLoop, factorialNumber);
            }
        }, {
            name: 'Add',
            fn: function () {
                CalculatorWASM.addWithLoopCount(N, 10, 20);
            }
            }, {
                name: 'Subtract',
            fn: function () {
                CalculatorWASM.subtractWithLoopCount(N, 30, 10);
            }
        }, {
            name: 'Multiply',
            fn: function () {
                CalculatorWASM.multiplyWithLoopCount(N, 15, 12);
            }
        }, {
            name: 'Divide',
            fn: function () {
                CalculatorWASM.divideWithLoopCount(N, 50, 5);
            }
        }];
    }

    benchmark(specs, operation) {
        const option = {
            duration: 100, // optional
            maxOperations: 1000 // optional
        };

        const result = microBenchmark.suite({
            duration: 100, // optional
            maxOperations: 1000, // optional
            specs
        });

        return result;
    }

    startTestInLoopJs() {
        const data = {
            categories: [],
            series: {
                column: [],
                line: []
            }
        };

        const result = Object.keys(this.specsInLoopJs).map(category => {
            return {
                category,
                result: _.sortBy(this.benchmark(this.specsInLoopJs[category]), 'name')
            };
        });

        data.categories = _.map(result[0].result, 'name');

        const columns = _.map(result, item => {
            return {
                name : item.category,
                data: _.map(item.result, test => test.time)
            }
        });

        data.series.column = columns;

        this.setState({
            dataInJsLoop: data
        });

        return Promise.resolve();
    }

    startTestInLoopWasm() {
        const data = {
            categories: [],
            series: {
                column: [],
                line: []
            }
        };

        const result = Object.keys(this.specsInLoopWasm).map(category => {
            return {
                category,
                result: _.sortBy(this.benchmark(this.specsInLoopWasm[category]), 'name')
            };
        });

        data.categories = _.map(result[0].result, 'name');

        const columns = _.map(result, item => {
            return {
                name: item.category,
                data: _.map(item.result, test => test.time)
            }
        });

        data.series.column = columns;

        this.setState({
            dataInWasmLoop: data
        });

        return Promise.resolve();
    }

    render() {
        return (
            <div>
                <h1>Hello WebAssembly in React</h1>
                <h3>from Assemblyscript to WebAssembly, not from C, C++, Rust</h3>
                <Chart id={'chart1'} title={'Javascript VS WebAssembly Performance, Loop In JS'} data={this.state.dataInJsLoop}/>
                <Chart id={'chart2'} title={'Javascript VS WebAssembly Performance, Loop In WASM'} data={this.state.dataInWasmLoop} />
            </div>
        );
    }
}

export default App;
