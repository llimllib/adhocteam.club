function tokenize(cmd) {
  return cmd
    .replace(new RegExp(/\(/, "g"), " ( ")
    .replace(new RegExp(/\)/, "g"), " ) ")
    .split(" ")
    .filter(x => x.length > 0);
}

function atom(token) {
  if (/^[0-9]+$/.test(token)) {
    return parseFloat(token);
  }
  return token;
}

function parse(data) {
  return readTokens(tokenize(data));
}

function readTokens(tokens) {
  if (tokens.length == 0) return;
  const tok = tokens.shift();
  if ("(" == tok) {
    const L = [];
    while (tokens[0] != ")") {
      L.push(readTokens(tokens));
    }
    tokens.shift();
    return L;
  } else if (")" == tok) {
    throw new Error("syntax exception");
  } else {
    return atom(tok);
  }
}

function eval_(expr, env) {
  if (!(expr instanceof Array)) {
    // now expr should be a string or a number
    // XXX this will disallow any string which is "add" or "sub"
    if (env.hasOwnProperty(expr)) {
      return env[expr];
    }
    return expr;
  } else {
    const proc = eval_(expr[0], env);
    const args = expr.slice(1).map(e => eval_(e, env));
    console.log(proc, args);
    return proc(...args);
  }
}

function ex(code, env) {
  return eval_(parse(code), env);
}

document.addEventListener("DOMContentLoaded", function(event) {
  const canvas = document.getElementById("wall"), ctx = canvas.getContext("2d");

  const env = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y,
    pi: Math.PI,
    cos: Math.cos,
    sin: Math.sin,
    imgDom: src => {
      img = document.createElement("img");
      img.src = src;
      return new Promise((resolve, reject) => img.onload = () => resolve(img));
    },
    drawImage: (imgPromise, x, y) =>
      imgPromise.then(img => ctx.drawImage(img, x, y)),
    // We have to use the arrow function to get a proper "this", otherwise
    // we get an invalid context error
    fillText: (text, x, y) => ctx.fillText(text, x, y)
  };

  /// XXX DELETEME debugggin globals
  ca = document.getElementById("wall");
  c = ca.getContext("2d");
  e = env;

  // TODO: test cross-domain URLs
  ex("(drawImage (imgDom test.jpg) 10 10)", env);
  ex("(fillText bananas 10 10)", env);
});
