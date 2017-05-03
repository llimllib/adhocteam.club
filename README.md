     _    _|  |_    _    _  |_   _    _    _ _       _  |       |_
    (_\  (_|  | )  (_)  (_  |_  (/_  (_\  | | |  .  (_  |  (_)  |_) 

adhocteam.club is a presentation server that encourages the viewers of a presentation to add graffiti to it in real time.

## Do it!

To graffiti the current presentation, run:

`curl -X POST -d '(; (font "24px serif") (fillText "Anarchy!" 100 100))' https://adhocteam.club/command`

or:

`curl -X POST -d '(drawImage "/static/adhoc.png" 10 100)' http://localhost:8080/command`

or try to send the same sort of request with your favorite programming language. Or a new programming language! Look I'm not your boss.

## langauge

If you want to graffiti my talk (and you definitely do) you will need to use my terrible home grown presentation lisp.

I would have let you use javascript, but you probably would have just redirected us to a youtube talk by a better speaker who
concentrated on the content of their talk instead of some silly technology to run it.

The language has only three data types: functions, strings, and numbers. It's a lisp, so every function call starts with a
symbol following a parenthesis.

## examples

Draw a few squares on the screen:

```
(; (fillRect 0 0 100 100) (fillRect 200 0 100 100) (fillRect 400 0 100 100) (fillRect 600 0 100 100)
   (fillRect 0 200 100 100) (fillRect 200 200 100 100) (fillRect 400 200 100 100) (fillRect 600 200 100 100)
   (fillRect 0 400 100 100) (fillRect 200 400 100 100) (fillRect 400 400 100 100) (fillRect 600 400 100 100)
)
```

Each command you issue is only allowed to be a single expression, so the `;` function helps you concatenate expressions.
For example,

`(; (expression a) (expression b))`

Just evaluates expression `a` followed by `b`.

```
(; (font '48px serif') (fillText 'bananas are a fine fruit' (spinLeft 3) (spinUp 3))))
```

This command sets the font, writes some text, and sets the x and y values of the text to spin left and up respectively.
The `3` here is a speed setting; `1` will move slowly, `3` at a medium pace, and `5` quickly.

```
(; (translate 300 300) (font '48px sans-serif') (rotateRight (% (/ (t) 10) 365)) (fillText 'whoa dude' 0 0))
```

This command will:
* move (translate) the starting point 300 down and 300 right
* set a font
* rotate the canvas right some amount
  * the `t` function returns the current time in milliseconds; we're just dividing it by 10 and modding it by 365 to get a degree for rotation
* write `whoa dude` to 0 0, which is actually at x 300 and y 300.
  * the reason we translate then write to 0 0 is that the rotate rotates around the origin of the canvas, so we want to
    move the origin rather than the text so it rotates without spinning away
    
 ```
 (; (translate
      (% (+ 10 (/ (t) 10)) (width))
      (% (+ 10 (/ (t) 10)) (height)))
    (font '24px serif')
    (rotateRight (% (/ (t) 10) 365))
    (fillText 'bananas' 0 0))
```

This command will:

* translate to `10 + (t/10) % width`, `10 + (t/10) % height`
  * (change the first 10 there to change where the text will start)
* set the font
* rotate to the right by `(t/10) % 365` degrees
* and draw the word "bananas"

The effect of this will be that the word "bananas" will spin out across the canvas

## functions

For now, [read the source!](https://github.com/llimllib/adhocteam.club/blob/master/static/index.js#L130). I'll get around to
officially documenting them probably never
