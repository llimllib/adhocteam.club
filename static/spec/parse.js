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

env = {
  "+": (x, y) => x + y,
  "-": (x, y) => x - y,
  "*": (x, y) => x * y,
  "/": (x, y) => x / y,
  pi: Math.PI,
  cos: Math.cos,
  sin: Math.sin
};

function eval_(expr) {
  if (!(expr instanceof Array)) {
    // now expr should be a string or a number
    // XXX this will disallow any string which is "add" or "sub"
    if (env.hasOwnProperty(expr)) {
      return env[expr];
    }
    return expr;
  } else {
    const proc = eval_(expr[0]);
    const args = expr.slice(1).map(eval_);
    // console.log(proc, args);
    return proc(...args);
  }
}

function ex(code) {
  return eval_(parse(code));
}

describe("parse", function() {
  it("should parse a simple cmd", function() {
    expect(parse("(test 1 2 3)")).toEqual(["test", 1, 2, 3]);
  });

  it("should parse recursively", function() {
    expect(parse("(test (test 1 2 3) 2 (test 1 2 3))")).toEqual([
      "test",
      ["test", 1, 2, 3],
      2,
      ["test", 1, 2, 3]
    ]);
  });

  it("should parse single-quoted strings", function() {
    expect(parse("(test 'one two three')")).toEqual(["test", "one two three"]);
  });

  it("should parse double-quoted strings", function() {
    expect(parse('(test "one two three")')).toEqual(["test", "one two three"]);
  });
});

describe("eval", function() {
  it("should eval", function() {
    expect(ex("(+ 1 2)")).toEqual(3);
  });

  it("should eval recursively", function() {
    expect(ex("(+ 1 (- 10 4))")).toEqual(7);
  });

  it("should allow constants", function() {
    expect(ex("(+ 1 (- pi 4))")).toBeCloseTo(Math.PI - 3, 5);
  });

  it("should work with cos", function() {
    expect(ex("(cos pi)")).toBeCloseTo(Math.cos(Math.PI), 5);
  });

  it("should work with sin", function() {
    expect(ex("(sin (/ pi 2))")).toBeCloseTo(1, 5);
  });

  it("should be exactly as dumb as javascript", function() {
    expect(ex("(+ 1 '2 bananas')")).toEqual("12 bananas");
  });
});
