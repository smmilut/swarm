# Swarm

## Description

An engine to display the behaviour of many individual *Dudes* in a web page.
The initial case is a swarm of bacteria which must survive with very simple resources :
* can only see sugar where it stands
* has no memory of previous states (except through the quantity of sugar eaten)
* can only move in a straight line and make a sharp turn right from time to time. This is the only degree of latitude.

With some nice parameters, the swarm "finds" the sugar.

The explanation is probably that :
* when there is little sugar to eat it makes large searching circles (long period between turns)
* when there is a lot of sugar to eat it makes tiny circles (short period between turns)

## Usage

Hosted as a GitHub Page at https://smmilut.github.io/swarm/

Click and drag on the canvas to spawn some *Dudes*. The length of the click-and-drag defines the initial speed vector.
Use the UI to modify some parameters live.

## "autoui"

A separate utility that generates UI controls dynamically based on a JS object.
Allows to quickly test the influence of some parameters.
Could turn into a separate project.

## Applications / re-use

This is a **learning project** with no particular claim of code quality, I am a beginner and programmed this while discovering.
If you're a beginner, you should probably not take inspiration from this code.
