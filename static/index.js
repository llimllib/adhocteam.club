function tokenize(cmd) {
  return cmd
    .replace(new RegExp(/\(/, "g"), " ( ")
    .replace(new RegExp(/\)/, "g"), " ) ")
    .replace(new RegExp(/'/, "g"), " ' ")
    .replace(new RegExp(/"/, "g"), ' " ')
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
  } else if ("'" == tok) {
    const string = [];
    while (tokens[0] != "'") {
      string.push(tokens.shift());
    }
    tokens.shift();
    return string.join(" ");
  } else if ('"' == tok) {
    const string = [];
    while (tokens[0] != '"') {
      string.push(tokens.shift());
    }
    tokens.shift();
    return string.join(" ");
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
    //console.log(proc, args);
    return proc(...args);
  }
}

function ex(code, env) {
  return eval_(parse(code), env);
}

function q(code, env) {
  commands[+new Date()] = () => ex(code, env);
  console.log(commands);
}

const commands = {}, blurDuration = 10;

function loop(env, ctx) {
  ctx.clearRect(0, 0, 1024, 768);
  const t = +new Date();
  Object.keys(commands).forEach(k => {
    const s = (t - k) / 1000;
    if (s > blurDuration) {
      delete commands[k];
      return;
    }
    ctx.globalAlpha = (blurDuration - s) / blurDuration;
    commands[k]();
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  const canvas = document.getElementById("wall"),
    ctx = canvas.getContext("2d"),
    images = {},
    width = 1024,
    height = 768;

  const env = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y,
    "%": (x, y) => x % y,
    ";": () => null,
    t: () => +new Date(),
    pi: Math.PI,
    cos: Math.cos,
    sin: Math.sin,
    width: () => width,
    height: () => height,
    imgDom: src => {
      if (images.hasOwnProperty(src)) {
        return new Promise((resolve, reject) => resolve(images[src]));
      }
      img = document.createElement("img");
      img.src = src;
      images[src] = img;
      return new Promise((resolve, reject) => img.onload = () => resolve(img));
    },
    drawImage: (imgPromise, x, y) =>
      imgPromise.then(img => ctx.drawImage(img, x, y)),
    font: font => ctx.font = font,
    // We have to use the arrow function to get a proper "this", otherwise
    // we get an invalid context error
    fillText: (text, x, y) => ctx.fillText(text, x, y),
    strokeText: (text, x, y) => ctx.strokeText(text, x, y),
    clearRect: (x, y, width, height) => ctx.clearRect(x, y, width, height),
    fillRect: (x, y, width, height) => ctx.fillRect(x, y, width, height),
    fillStyle: fill => ctx.fillStyle = fill,
    strokeStyle: stroke => ctx.strokeStyle = stroke,
    strokeRect: (x, y, width, height) => ctx.strokeRect(x, y, width, height),
    log: s => console.log(s),
    invert: () => {
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
    }
  };

  // Start the main loop. 60 FPS if each loop takes no time, we probably
  // don't need anything fancier?
  setInterval(() => loop(env, ctx), 1000 / 60);

  /// XXX DELETEME debugggin globals
  ca = document.getElementById("wall");
  c = ca.getContext("2d");
  e = env;

  // TODO: * test cross-domain URLs
  //       * possibly just accept a src to drawImage?
  q("(drawImage (imgDom adhoc.png) 10 100)", env);
  q(
    "(; (font '48px serif') (fillText 'bananas are a fine fruit' (% (/ (t) 10) (width)) 50)))",
    env
  );
  q("(invert)", env);
});
