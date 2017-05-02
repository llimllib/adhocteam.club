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
    if (typeof expr === "string" && env.hasOwnProperty(expr.trim())) {
      return env[expr.trim()];
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
  const t = +new Date();
  env["start"] = () => t;
  commands.push([t, () => ex(code, env)]);
}

const commands = [], blurDuration = 10;

function loop(env, ctx) {
  ctx.clearRect(0, 0, 1024, 768);
  const t = +new Date();
  commands.forEach(([k, cmd], idx) => {
    const s = (t - k) / 1000;

    // remove a command after blurDuration seconds
    if (s > blurDuration) {
      commands.splice(idx, 1);
      return;
    }

    ctx.globalAlpha = (blurDuration - s) / blurDuration;
    ctx.save();
    try {
      cmd();
    } catch (e) {
      console.error("got error", e, "when executing cmd", cmd, "removing it");
      commands.splice(idx, 1);
    }

    ctx.restore();
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  const canvas = document.getElementById("wall"),
    ctx = canvas.getContext("2d"),
    images = {},
    width = 1024,
    height = 768,
    speed = {
      1: 100,
      2: 50,
      3: 10,
      4: 3,
      5: 1
    };

  function env() {
    return {
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
      drawImage: (src, x, y) => {
        if (images.hasOwnProperty(src)) {
          // the image is undefined until it gets onload-ed
          if (images[src] !== undefined) {
            ctx.drawImage(images[src], x, y);
          }
        } else {
          const img = document.createElement("img");
          img.src = src;
          images[src] = undefined;
          img.onload = () => {
            console.log(img);
            images[src] = img;
          };
          console.log(images, src, img);
        }
      },

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
      },

      // Animation
      // 1 is slow, 5 is fast
      spinRight: s => {
        return +new Date() / speed[s] % width;
      },
      spinLeft: s => {
        return width - +new Date() / speed[s] % width;
      },
      spinDown: s => {
        return +new Date() / speed[s] % height;
      },
      spinUp: s => {
        return height - +new Date() / speed[s] % height;
      },
      rotateRight: degrees => {
        ctx.rotate(degrees * Math.PI / 180);
      },
      rotateLeft: degrees => {
        ctx.rotate(-degrees * Math.PI / 180);
      },
      translate: (x, y) => {
        ctx.translate(x, y);
      }
    };
  }

  // Start the main loop. 60 FPS if each loop takes no time, we probably
  // don't need anything fancier?
  setInterval(() => loop(env(), ctx), 1000 / 60);
  //setTimeout(() => loop(env, ctx), 1000 / 60);

  /// XXX DELETEME debugggin globals
  ca = document.getElementById("wall");
  c = ca.getContext("2d");
  e = env();

  // TODO: * test cross-domain URLs
  //       * possibly just accept a src to drawImage?
  q("(drawImage /static/adhoc.png 10 100)", env());
  q("(drawImage https://billmill.org/images/logo.png (spinLeft 2) 100)", env());
  q(
    "(; (font '48px serif') (fillText 'bananas are a fine fruit' (spinLeft 3) (spinUp 3))))",
    env()
  );
  q(
    `(;
    (fillRect 0 0 100 100) (fillRect 200 0 100 100) (fillRect 400 0 100 100) (fillRect 600 0 100 100)
    (fillRect 0 200 100 100) (fillRect 200 200 100 100) (fillRect 400 200 100 100) (fillRect 600 200 100 100)
    (fillRect 0 400 100 100) (fillRect 200 400 100 100) (fillRect 400 400 100 100) (fillRect 600 400 100 100)
  )`,
    env()
  );
  q(
    "(; (translate 300 300) (font '48px sans-serif') (rotateRight (% (/ (t) 10) 365)) (fillText 'whoa dude' 0 0))",
    env()
  );

  const proto = document.location.protocol.match(/(.):/)[1] == "s"
    ? "wss"
    : "ws",
    conn = new WebSocket(`${proto}://${document.location.host}/ws`);
  conn.onclose = function(evt) {
    console.log("closing");
  };
  conn.onmessage = function(evt) {
    console.log("got evt", evt);
    q(evt.data, env());
  };
  conn.onerror = function(err) {
    console.error("ERROR: ", err);
  };
});
