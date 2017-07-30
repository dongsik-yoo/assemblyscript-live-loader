'use strict';

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

function factorial(num) {
    let tmp = num;

    if (num < 0) {
        return -1;
    } else if (num === 0) {
        return 1;
    }

    while (num > 2) {
        tmp *= num;
        num -= 1;
    }

    return tmp;
}

function addWithLoopCount(count, a, b) {
    let i = 0;
    for (; i < count; i += 1) {
        add(a, b);
    }
}

function subtractWithLoopCount(count, a, b) {
    let i = 0;
    for (; i < count; i += 1) {
        subtract(a, b);
    }
}

function multiplyWithLoopCount(count, a, b) {
    let i = 0;
    for (; i < count; i += 1) {
        multiply(a, b);
    }
}

function divideWithLoopCount(count, a, b) {
    let i = 0;
    for (; i < count; i += 1) {
        divide(a, b);
    }
}

function factorialWithLoopCount(count, num) {
    let i = 0;
    for (; i < count; i += 1) {
        factorial(num);
    }
}

module.exports = {
    add,
    subtract,
    multiply,
    divide,
    factorial,
    addWithLoopCount,
    subtractWithLoopCount,
    multiplyWithLoopCount,
    divideWithLoopCount,
    factorialWithLoopCount
};
