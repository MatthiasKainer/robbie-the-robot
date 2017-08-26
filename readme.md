# Robbie The Robot

[![travisci-build](https://api.travis-ci.org/MatthiasKainer/robbie-the-robot.svg?branch=master)](https://travis-ci.org/1and1/itBldz) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3c0a3e5e57fc404f88ce2ffd04428865)](https://www.codacy.com/app/MatthiasKainer/robbie-the-robot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=MatthiasKainer/robbie-the-robot&amp;utm_campaign=Badge_Grade) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3c0a3e5e57fc404f88ce2ffd04428865)](https://www.codacy.com/app/MatthiasKainer/robbie-the-robot?utm_source=github.com&utm_medium=referral&utm_content=MatthiasKainer/robbie-the-robot&utm_campaign=Badge_Coverage)

Robbie the robot is a small, html based browser game for 3-6 year old children. Its aim is to help children develop a feeling for executing certain commands in advance before running them. 

It is influenced by [Scratch](https://scratch.mit.edu/) which however proved to be too tricky for my little kids.

You can see a live demo on [robbie-the-robot.herokuapp.com/](https://robbie-the-robot.herokuapp.com/)

Graphics from freebies @[GameArt2D.com](http://www.gameart2d.com/)

## Develop/Run it

_Requirements:_

* node/npm
* typescript
* itbldz

_run watcher with tests while deving_

```sh
npm start test
```

_build it and run it_

```sh
$ build-it && npm start
```

## robbielang

### intro

To make the game more extensible, the game comes with a very simple programming language called robbielang. For a future version it is planned this language can be used directly in game. 

robbielang is designed to be easy to understand, fault tolerant, and as verbose as possible. The language capabilites are currently only developed as far as needed for this game. 

The language was designed after a short discussion with an elementary schoolkid who was complaining about what is unnecessary difficult in todays programming languages. 

The specification has not been formulated thoroughly and may (and most probable will) change. 

### example

An example of the usage for this language as used in the game itself for movement is:

```robbielang
then move in the direction up
then move in the direction right
```

The first part `the robot is...` represents an assignment of the variable robot with a datastructure `Robot`, the same is done for `Position`.

Next a function `move` is created with a parameter `direction`. `direction` is compared and matched against strings. Note that in robbielang, strings do not have to be enclosed by `"` or `'` (except for multiline strings). It is up to the compiler to identify the intend of the user.

At arbitary positions in the code, a variable can be exported. The code afterwards is still executed. 

### multilanguage

robbielang can (in reminiscence to vb) be implemented in multiple languages. The only other language supported is German.

In german, the language sounds like this:

```robbielang
dann bewege in die Richtung hoch
```