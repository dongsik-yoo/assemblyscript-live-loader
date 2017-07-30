AssemblyScript로 작성하고 WebAssembly로 실행할 수 있는 방법을 소개하고 자바스크립트와 WebAssembly의 간단한 성능 테스트에 대해서 소개한다.

# 자바스크립트로 작성하고 WebAssembly로 바로 쓰는 법
세상에는 많은 프로그래밍 언어들이 있고 여러 가지 측면에서 장단점을 이야기 하곤 한다. 내가 다루어 본 언어 중에서 성능 측면에서 보자면 C/C++ > 자바 > 자바스크립트가 될 것이고 생산성 측면은 사람마다 다를 수 있지만 자바스크립트 > 자바 > C/C++ 정도 인 것 같다. 자바스크립트 월드에서는  JIT(Just-In-Time) 컴파일러가 등장하면서 성능의 비약적인 발전을 이루었고 웹 어플리케이션의 규모도 점점 더 커질 수 있는 초석이 되었다. 그럼에도 불구하고 여전히 성능에 대한 목마름은 해소가 되지 않았고 WebAssembly 라는 것이 등장하였다. WebAssembly는 Weekly Pick 에서도 여러 번 다루어 왔던 주제이다.
* [웹어셈블리 바로 사용 해보기](https://github.com/nhnent/fe.javascript/wiki/April-3-April-7,-2017)
* [웹어셈블리는 왜 빠를까?](https://github.com/nhnent/fe.javascript/wiki/March-20-March-24,-2017)
* [당신의 첫 웹어셈블리 컴포넌트를 만들어보자](https://github.com/nhnent/fe.javascript/wiki/July-4-July-8,-2016)
 
성능에 있어서 가장 큰 차이점은 컴파일을 언제 하는가(컴파일 언어와 인터프리터 언어), 실행 코드가 Assembly로 바로 실행되는가 중간코드를 실행하기 위한 VM(Virtual Machine)이 있는가로 볼 수 있겠다. 아시다시피 자바스크립트는 그 유연함과 생산성에 잇점이 있는 대신 런타임에 해석되고 컴파일 및 실행되기 때문에 성능에 있어서는 포기해야 할 부분이 있다.

## WebAssembly 로 변환할 수 있는 방법들
이미 작성된 파이어폭스에서 구동되던 asm.js 코드, C/C++ 코드를 아래와 같은 툴체인을 사용하여 WebAssembly 모듈로 변환할 수 있다. 
* asm.js 로 작성하고 WebAssembly로 변환하기([binaryen](https://github.com/WebAssembly/binaryen))
* C/C++ 로 작성하고 WebAssembly로 변환하기([Emscripten](http://kripken.github.io/emscripten-site/))

하지만 프론트엔드 개발자에게 빠른 성능을 얻기 위해 WebAssembly 모듈을 얻기란 너무나도 먼 길이 기다리고 있다. make, llvm, C/C++, Compile, Linking 등과 같은 생소한 과정들을 난감함과 고통과 배움을 통해 WebAssembly로 승화시켜야 하는 것이다. 그리고 만들어진 모듈을  Webpack이나 rollup 같은 개발환경에서 통합시켜야 하는 과정을 거쳐야 한다. WebAssembly 소개글들의 대다수가 C/C++에서 main 함수를 만들고 "Hello World"라는 인사만 하는 것도 어느 정도 이해가 간다. 

그 과정을 모두 거치쳐서 실전에서 써먹을 만한 모듈을 만드려고 하는 생각은 내 손가락까지 타고 넘어오지는 못할 것이다.

## [AssemblyScript](https://github.com/dcodeIO/AssemblyScript)
WebAssembly로 변환할 수 있는 언어의 조건은 변수의 타입을 확인할 수 있는 언어이어야 한다는 특징이 있다. C/C++, [Rust](https://medium.com/@ianjsikes/get-started-with-rust-webassembly-and-webpack-58d28e219635), TypeScript([WebAssembly 컴파일 타겟 추가에 대한 논의](https://github.com/Microsoft/TypeScript/issues/9202)) 등의 언어들이 WebAssembly로 변환될 수 있는데, Typescript의 하위집합인 **"AssemblyScript"** 또한 WebAssembly로 변환이 가능하다. AssemblyScript를 선택한 이유는 사용성이다. NPM에 등록이 되어 있고 프론트 엔드 개발자가 보다 쉽게 WebAssembly 코드를 테스트할 수 있기 때문이다.

AssemblyScript로 WebAssembly를 작성할 때 주의 사항은 아래와 같다.
* 암시적인 형변환을 막기 위해 타입을 명시할 것
* 기본 매개변수는 기본값 초기화가 필요
* 명확한 타입만 지원(any나 undefined는 지원하지 않음)
* 논리 연산자 &&와 || 는 항상 bool 값을 의미

[assemblyscript](https://www.npmjs.com/package/assemblyscript)를 NPM으로 설치하면 커맨드라인에서 보다 쉽게 컴파일 하여 .wasm 파일을 만들어 낼 수가 있다. 또한 생성된 wasm파일을 모듈로 사용할 수 있는 [assemblyscript-loader](https://www.npmjs.com/package/assemblyscript-loader)나 [wasm-loader](https://www.npmjs.com/package/wasm-loader) 도 있는데 둘의 차이점은 전자는 코드 내에서 wasm 모듈을 로딩할 수 있고 옵션이 많고, 후자는 webpack 로더로 제공되고 좀 더 쉽게 사용하고 번들링도 가능하다는 점이다. 

## AssemblyScript를 좀 더 사용하기 쉽게
앞서 말했듯이 C, C++과 같은 네이티브 언어로부터 컴파일하여 WebAssembly 를 사용하기에는 절차가 너무 복잡하다. 익숙한 자바스크립트 언어 계열로 작성하고 바로 WebAssembly로 컴파일 되면서 Webpack을 사용하여 바로 번들링 되도록 해보자.

## [assemblyscript-live-loader](https://github.com/dongsik-yoo/assemblyscript-live-loader)
앞에 소개한 두 NPM 패키지를 사용하면 그나마 쉽게 사용할 수가 있지만 Webpack 개발환경에서 자바스크립트 코드를 작성하고 바로 번들링 되는 것처럼 편하게 사용하기 위해서는 각각 조금씩 부족한 모습이 있어서 Webpack 로더를 직접 작성하였다. 두 가지 기능을 지원한다.
* AssemblyScript를 WASM으로 컴파일
* WASM 모듈을 WebAssembly.Module 로 사용할 수 있도록 번들링

참고: wasm-loader 사용 시에는 uglifying에 에러가 있어서 wasm 로딩 부분은 직접 작성하였다. 

## 패키지 설치
아직 NPM에는 등록하지 않았으니 깃허브로부터 직접 인스톨한다.
```
npm install --save-dev https://github.com/dongsik-yoo/assemblyscript-live-loader.git
```

## Webpack Loader config
그리고 Webpack 에 assemblysciprt 로 작성한 파일을 번들링 할 수 있도록 설정에 추가한다.

webpack.config.js

``` js
module: {
    loaders: [
        {
            test: /\.asc$/, // assemblyscript 소스 파일
            exclude: '/node_modules/',
            loader: 'assemblyscript-live-loader'
        }
    ]
}
```

## AssemblyScript 로 WebAssembly로 컴파일할 코드를 작성
**./asc/Calculator.asc** 파일을 생성하고 아래 내용을 작성한다.

``` js
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

## 모듈 가져오기
그러면 이제 복잡스러워 보이는 컴파일 과정과 모듈 로딩 과정이 Webpack 로더를 통해 알아서 진행이 된다. 이제
**index.js** 에 사용할 WebAssembly 모듈을 추가하고 작성한 테스트 함수를 호출해서 결과를 받을 수 있다.

``` js
import Calculator from './asc/Calculator.asc';

const calc = new Calculator().exports;
const add = calc.add(44, 8832);
const subtract = calc.subtract(100, 20);
const multiply = calc.multiply(13, 4);
const divide = calc.divide(20, 4);

console.log(add);
console.log(subtract);
console.log(multiply);
console.log(divide);
```

## Build

```
npx webpack
```
참고: NPM 5.2에서 추가된 npx를 사용하면 편리하다.


# Javascript와 WebAssembly 성능 테스트
글을 쓰기 전에는 WebAssembly 가 보통 빠를 것이라는 기대감으로 시작하였다. 간단한 사칙 연산과 factorial 를 자바스크립트와 AssemblyScript로 컴파일한 WebAssembly버전으로 작성하여 성능 측정을 진행했다. 그런데 생각보다 WebAssembly에 대한 성능측정 결과는 기대와는 다르게 나왔다. 

참고: 크롬과 파이어폭스는 이제 WebAssembly를 기본으로 적용하여 테스트해 볼 수가 있다. 

## 테스트 환경
* 테스트 도구: Chrome 59.0.3071.115, Firefox 54.0.1, [micro-benchmark](https://www.npmjs.com/package/micro-benchmark), 
* 테스트 결과 챠트: [TUI-Chart](https://github.com/nhnent/tui.chart) 2.9.0
* 테스트 연산: 더하기, 빼기, 곱하기, 나누기, factorial 
* 범례: 자바스크립트(붉은 색), WebAssembly(주황색)

### 테스트 페이지
위의 테스트는 [여기](https://dongsik-yoo.github.io/assemblyscript-live-loader/)에서 다시 확인해 볼 수 있다. 

## 테스트 코드
테스트 코드는 [Javascript](), [WebAssembly](), [benchmark 구동 코드]() 에서 확인할 수 있다.


### Chrome 테스트 결과
![chrome, performance loop in wasm](https://user-images.githubusercontent.com/26706716/28753349-16cb5c80-756f-11e7-8f77-fcf6b159e17a.png)
![chrome, performance loop in js](https://user-images.githubusercontent.com/26706716/28753350-17367560-756f-11e7-9bb6-814013a9bd33.png)

### Firefox 테스트 결과
![firefox, performance loop in wasm](https://user-images.githubusercontent.com/26706716/28753711-3144802e-7573-11e7-8330-87b1b4233ff5.png)
![firefox, performance loop in js 1](https://user-images.githubusercontent.com/26706716/28753712-31f71a68-7573-11e7-96d0-5f56f9ca830d.png)

## 테스트 결과와 맺음글
많은 이들이 예측하는 것처럼 WebAssembly는 자바스크립트를 대체하기 보다는 자바스크립트보다 빠르게 구동될 수 있는 모듈을 WebAssembly롤 통해 성능 개선을 대체하는 방식이 될 것이다. 자바스크립트의 성능을 좌우하는 요소들이 너무나 많다. 글을 쓰려고 할 때는 WebAssembly가 단연코 빠를 것이라고 생각했지만 웃기게도 factorial 을 제외한 사칙연산의 성능은 자바스크립트가 더 빠르게 측정되었다. 여기서 성능에 영향을 주는 요소는 많지만 몇 가지 꼽자면
* 자바스크립트 엔진의 성능
* 예상보다 빠른 JIT의 성능 최적화
* 콜스택 처리 성능(예> 재귀함수를 쓰는 경우)
* WebAssembly 함수를 호출 할 때 드는 비용

이 테스트에서는 반복적인 루프를 수행하면서 간단한 사칙연산들은 JIT에서 반복적인 코드가 Assembly로 컴파일이 되면서 오히려 더 빠르지 않았을까 한다. 또한 이른바 “트램폴린(trampolining)”이라고 하는 자바스크립트에서 WebAssembly 로 컨텍스트를 전환하는 과정에서 상당한 성능을 깎아 먹은 것으로 보인다. 크롬과 파이어폭스 사이에서도 차이도 크다.

  JIT가 등장하면서 자바스크립트 엔진의 불꽃 튀는 성능 경쟁 구도가 그려졌다면, 앞으로 펼쳐질 WebAssembly의 성능 경쟁도 한번 눈여겨 볼만 하다.

## 그리고 남은 이야기
WebAssembly 모듈에서 에러가 발생할 경우 어떻게 디버깅을 할까 고민을 했는데 그나마 다행스럽게도 크롬에서 콜스택을 아래와 같이 찍어 주고 있다.
![error stack](https://user-images.githubusercontent.com/26706716/28753338-e5c503b6-756e-11e7-9ee4-fb230fe539ce.png)


## Reference
* [AssemblyScript Github](https://github.com/dcodeIO/AssemblyScript)
* [wasm-loader](https://github.com/ballercat/wasm-loader)
* [Webpack: How to write a loader](https://webpack.github.io/docs/how-to-write-a-loader.html)
* [웹 어셈블리의 현재와 미래](https://dongwoo.blog/2017/06/06/%EB%B2%88%EC%97%AD-%EC%9B%B9%EC%96%B4%EC%85%88%EB%B8%94%EB%A6%AC%EC%9D%98-%ED%98%84%EC%9E%AC-%EC%9C%84%EC%B9%98%EC%99%80-%EB%AF%B8%EB%9E%98/) - 6개의 번역 글 모두 정주행 해보길 권한다.


