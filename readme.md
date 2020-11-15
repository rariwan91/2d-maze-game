# The Game

This is a simplified Legend of Zelda clone.
The player moves around between rooms and fights enemies.
I will be adding features over time.

## Features

* Rooms
  * Loaded from src/levels.json
* Pursuing Enemies
  * Enemies path around obstructions
  * Enemies with a punch attack
  * Enemies with a sword attack
* Player Weapons:
  * Sword
* Health
* Configurable debug values from src/config.ts

## How to Run

Until I figure out how to use `electron` you simply:

1. Clone my repo
2. `cd` into it
3. `npm install` to install dependencies.
4. Your choice of:
   1. `npm run wp-start` to run it in a browser.
   2. `npm run e-start` to run it as an electron desktop application.
   3. `npm run start` to build and package it into a desktop application you can double-click to run.
