
// Thank you, https://github.com/infusion/Complex.js/blob/10d2a84bbf281b53ea4ce0993d0794922e214daf/complex.js

// guppy AST: https://guppy.js.org/build/coverage/src/ast.js.html




// real -> real functions

function r_cosh(x) {
    return (Math.exp(x) + Math.exp(-x)) * 0.5;
  };
function r_sinh(x) {
    return (Math.exp(x) - Math.exp(-x)) * 0.5;
  };




// complex -> real functions

function logHypot(a) {
  var _a = Math.abs(a.re);
  var _b = Math.abs(a.im);
  if (a.re === 0) {
    return Math.log(_b);
  }
  if (a.im === 0) {
    return Math.log(_a);
  }
  if (_a < 3000 && _b < 3000) {
    return Math.log(a.re * a.re + a.im * a.im) * 0.5;
  }
  return Math.log(a.re / Math.cos(Math.atan2(a.im, a.re)));
}



// complex -> boolean

function isZero(a) {
  return a.re == 0 && a.im == 0;
}

function isInfinity(a) {
  return (a.re == Infinity || a.im == Infinity || isNaN(a.re) || isNaN(a.im));
}


// complex -> complex functions


function add(a,b) {
  return {re: a.re + b.re,
          im: a.im + b.im}
}
function multiply(a,b) {
  return {re: a.re * b.re - a.im * b.im,
          im: a.re * b.im + a.im * b.re}
}
function divide(a,b) {
  return {re: (a.re * b.re + a.im * b.im) / (b.re**2 + b.im**2),
          im: (a.im * b.im - a.re * b.im) / (b.re**2 + b.im**2)};
}
function negate(a) {
  return {re:-a.re, im:-a.im};
}
function subtract(a,b) {
  return {re: a.re - b.re,
          im: a.im - b.im};
}
function exponential(a,b) {

  if (isZero(b)) {
    return {re:1, im:0};
  }

  // If the exponent is real
  if (b.im === 0) {
    if (a.im === 0 && a.re >= 0) {
      return {re:Math.pow(a.re, b.re), im:0};
    } else if (b.re === 0) { // If base is fully imaginary
      switch ((b.re % 4 + 4) % 4) {
        case 0: return {re:Math.pow(a.im, b.re), im:0};
        case 1: return {re:0, im:Math.pow(a.im, b.re)};
        case 2: return {re:-Math.pow(a.im, b.re), im:0};
        case 3: return {re:0, im:-Math.pow(a.im, b.re)};
      }
    }
  }

  if (a.re === 0 && a.im === 0 && b.re > 0 && b.im >= 0) {
    return {re:0, im:0};
  }

  var arg = Math.atan2(a.im, a.re);
  var loh = logHypot(a);

  a = Math.exp(b.re * loh - b.im * arg);
  b = b.im * loh + b.re * arg;
  return {re:a * Math.cos(b),
          im:a * Math.sin(b)};
}
function modulus(a) {
  return {re:Math.sqrt(a.re**2 + a.im**2),
          im:0};
}
function conjugate(a) {
  return {re:a.re,
          im:-a.im};
}
function sin(a) {
  return {re:Math.sin(a.re) * r_cosh(a.im),
          im:Math.cos(a.re) * r_sinh(a.im)};
}
function cos(a) {
  return {re:Math.cos(a.re) * r_cosh(a.im),
          im:-Math.sin(a.re) * r_sinh(a.im)};
}
function tan(a) {
  const d = Math.cos(a.re) + r_cosh(a.im);
  return {re:Math.sin(a.re) / d,
          im:r_sinh(a.im) / d};
}
function log(a) {
  return {re: logHypot(a),
          im: Math.atan2(a.im, a.re)};
}
function cot(a) {
  const d = Math.cos(2 * a.re) - r_cosh(2 * a.im);
  return {re:-Math.sin(2 * a.re) / d,
          im:r_sinh(2 * a.im) / d};
}
function sec(a) {
  const d = 0.5 * (r_cosh(2 * a.im) + Math.cos(2 * a.re));
  return {re: Math.cos(a.re) * r_cosh(a.im) / d,
          im: Math.sin(a.re) * r_sinh(a.im) / d};
}
function csc(a) {
  const d = 0.5 * (r_cosh(2 * a.im) - Math.cos(2 * a.re));
  return {re: Math.sin(a.re) * r_cosh(a.im) / d,
          im: -Math.cos(a.re) * r_sinh(a.im) / d};
}



var complex_operations = {
  "+":function(args){
    return function(vars){
      return add(args[0](vars),args[1](vars));
    };
  },
  "*":function(args){
    return function(vars){
      return multiply(args[0](vars),args[1](vars));
    };
  },
  "fraction":function(args){
    return function(vars){
      return divide(args[0](vars),args[1](vars));
    }
  },
  "/":function(args){
    return function(vars){
      return divide(args[0](vars),args[1](vars));
    }
  },
  "-":function(args){
    return function(vars){
      if (args.length == 1) {
        return negate(args[0](vars));
      }
      return subtract(args[0](vars), args[1](vars));
    }
  },
  "neg":function(args){
    return function(vars){
      return negate(args[0](vars));
    }
  },
  "val":function(args){
    return function(){
      if (!isNaN(args[0])) {
        return {re:args[0], im:0};
      }
      return args[0];
    }
  },
  "var":function(args){
    return function(vars){
      if(args[0] == "pi") return {re:Math.PI, im:0};
      if(args[0] == "e") return {re:Math.E, im:0};
      if(args[0] == "i") return {re:0, im:1};
      return vars[args[0]];
    }
  },
  "exponential":function(args){
    return function(vars){
      return exponential(args[0](vars), args[1](vars));
    }
  },
  "conj":function(args){
    return function(vars){
      return conjugate(args[0](vars));
    }
  },
  "squareroot":function(args){
    return function(vars){
      return exponential(args[0](vars), {re:1/2, im:0});
    }
  },
  "absolutevalue": function(args) {
    return function(vars){
      return modulus(args[0](vars));
    }
  },
  "sin": function(args) {
    return function(vars){
      return sin(args[0](vars));
    }
  },
  "cos": function(args) {
    return function(vars){
      return cos(args[0](vars));
    }
  },
  "tan": function(args) {
    return function(vars){
      return tan(args[0](vars));
    }
  },
  "log": function(args) {
    return function(vars){
      return log(args[0](vars));
    }
  },
  "cot": function(args) {
    return function(vars){
      return cot(args[0](vars));
    }
  },
  "sec": function(args) {
    return function(vars){
      return sec(args[0](vars));
    }
  },
  "csc": function(args) {
    return function(vars){
      return csc(args[0](vars));
    }
  },
};
