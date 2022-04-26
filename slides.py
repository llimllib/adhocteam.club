# coding=utf-8

import os
import requests
import random
import time
from flask import Flask, redirect

app = Flask(__name__)

CLUB_URL = os.environ.get("CLUB_URL", "http://localhost:8080")


def c(body):
    requests.post(f"{CLUB_URL}/command", body.encode("utf-8"))


def welcome():
    for _ in range(12):
        c(
            f"""
(; (translate {random.randint(0, 1024)} {random.randint(0, 768)})
   (font '48px serif')
   (color 'red')
   (rotateRight (% (/ (t) 10) 365))
   (strokeText 'welcome' -50 0))"""
        )


def adhoc_club():
    c(
        f"""
(; (font '48px serif')
   (color 'blue')
   (fillText 'adhocteam.club' (spinLeft 1) 50))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'blue')
   (fillText 'adhocteam.club' (spinLeft 2) 250))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'blue')
   (fillText 'adhocteam.club' (spinLeft 3) 450))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'blue')
   (fillText 'adhocteam.club' (spinLeft 4) 650))"""
    )


def graffiti():
    c("(drawImage /static/graffiti.jpg (spinLeft 1) 0)")


def arch():
    c("(drawImage /static/arch2.jpg 0 0)")


def github_address():
    c(
        f"""
(; (font '48px serif')
   (color 'green')
   (fillText 'github.com/llimllib/adhocteam.club' (spinRight 4) 50))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'green')
   (fillText 'github.com/llimllib/adhocteam.club' (spinRight 3) 250))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'green')
   (fillText 'github.com/llimllib/adhocteam.club' (spinRight 2) 450))"""
    )
    c(
        f"""
(; (font '48px serif')
   (color 'green')
   (fillText 'github.com/llimllib/adhocteam.club' (spinRight 1) 650))"""
    )


def adhoc():
    for _ in range(15):
        c(
            f"""
Λλ
(; (translate {random.randint(0, 750)} {random.randint(0, 768)})
   (drawImage /static/adhoc.png (goLeft 3) (goUp 3)))"""
        )


def reliability():
    c(
        """
(; (translate 512 334)
   (font '48px serif')
   (color 'aqua')
   (rotateRight (% (/ (t) 10) 365))
   (fillText 'reliability' -50 -24))"""
    )


def reliable_things():
    c(
        """
(; (translate 200 200)
   (rotateRight (% (/ (t) 10) 365))
   (drawImage /static/golang.png -100 -100 200 200))
    """
    )
    c(
        """
(; (translate 800 400)
   (rotateRight (% (/ (t) 10) 365))
   (drawImage /static/ruby.png -100 -100 200 200))
    """
    )
    c(
        """
(; (translate 400 500)
   (rotateRight (% (/ (t) 10) 365))
   (drawImage /static/postgres.png -100 -100 200 200))
    """
    )


def lambada():
    for _ in range(15):
        c(
            f"""
(; (translate {random.randint(0, 1024)} {random.randint(0, 768)})
   (font '158px serif')
   (color 'cornflowerblue')
   (rotateRight (% (/ (t) 10) 365))
   (strokeText 'Λλ' -20 -10))"""
        )
        time.sleep(0.2)


def fp_languages():
    for lang in ["scala", "elixir", "haskell", "kotlin", "f#", "ocaml", "clojure"]:
        c(
            f"""
(; (translate {random.randint(0, 1024)} {random.randint(0, 768)})
   (font '158px serif')
   (color 'darkseagreen')
   (rotateRight (% (/ (t) 10) 365))
   (fillText '{lang}' -150 -10))"""
        )
        time.sleep(0.2)


def types_in_imperative():
    for lang in ["flow", "typescript", "mypy", "crystal", "elixir"]:
        c(
            f"""
(; (translate {random.randint(0, 1024)} {random.randint(0, 768)})
   (font '158px serif')
   (color 'darkseagreen')
   (rotateRight (% (/ (t) 10) 365))
   (fillText '{lang}' -150 -10))"""
        )
        time.sleep(0.2)


commands = [
    ("welcome", welcome),
    ("adhoc_club", adhoc_club),
    ("graffiti", graffiti),
    ("architecture", arch),
    ("github address", github_address),
    ("adhoc", adhoc),
    ("reliability", reliability),
    ("reliable things", reliable_things),
    ("lambda", lambada),
    ("FP languages", fp_languages),
    ("types_in_imperative", types_in_imperative),
]

flist = "\n<br>".join(
    f'<a href="/commands/{i}">{name}</a>' for i, (name, _) in enumerate(commands)
)


@app.route("/")
def hello_world():
    return flist


@app.route("/commands/<int:cmdid>")
def run(cmdid):
    commands[cmdid][1]()
    return redirect("/")
