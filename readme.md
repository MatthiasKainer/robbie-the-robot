# Robbie The Robot

[![travisci-build](https://api.travis-ci.org/MatthiasKainer/robbie-the-robot.svg?branch=master)](https://travis-ci.org/1and1/itBldz)

Robbie the robot is a small, html based browser game for 3-6 year old children. Its aim is to help children develop a feeling for executing certain commands in advance before running them. 

It is influenced by [Scratch](https://scratch.mit.edu/) which however proved to be too tricky for my little kids. 

You can see a live demo on [robbie-the-robot.herokuapp.com/](https://robbie-the-robot.herokuapp.com/)

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
the robot is a Robot (
    the position is a Position (
        the row is 1
        the column is 1
    )
)

when move in the direction (
    if our direction (
        up (
            robot.position.row is our robot.position.row - 1
        )
        down (
            robot.position.row is our robot.position.row + 1
        )
        left (
            robot.position.column is our robot.position.column - 1
        )
        right (
            robot.position.column is our robot.position.column + 1
        )
    )
    
    export robot
)

then move in the direction up
```

The first part `the robot is...` represents an assignment of the variable robot with a datastructure `Robot`, the same is done for `Position`.

Next a function `move` is created with a parameter `direction`. `direction` is compared and matched against strings. Note that in robbielang, strings do not have to be enclosed by `"` or `'` (except for multiline strings). It is up to the compiler to identify the intend of the user.

At arbitary positions in the code, a variable can be exported. The code afterwards is still executed. 

### multilanguage

robbielang can (in reminiscence to vb) be implemented in multiple languages. The only other language supported is German.

In german, the language sounds like this:

```robbielang
der Roboter ist ein Roboter (
    die Position ist eine Position (
        die Reihe ist 1
        die Spalte ist 2
    )
)

wenn bewege in die Richtung (
    falls unsere Richtung (
        hoch (
            Roboter.Position.Reihe ist unser Roboter.Position.Reihe - 1
        )
        runter (
            Roboter.Position.Reihe ist unser Roboter.Position.Reihe + 1
        )
        links (
            Roboter.Position.Spalte ist unser Roboter.Position.Spalte - 1
        )
        rechts (
            Roboter.Position.Spalte ist unser Roboter.Position.Spalte + 1
        )
    )
    
    sag Roboter
)

dann bewege in die Richtung hoch
```