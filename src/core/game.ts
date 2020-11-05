import { Direction, GameState, IMyScreen, IRespondsToInput, MyScreen } from '.'
import { Enemy, EnemyState, IEnemy, IPlayer, IRoom, IWall, Player, Room, RoomState, Wall } from './entities'
import { IPoint, IText, Keycode } from '../gui'

import { Claw } from './entities/weapons/claw'
import { EnemySword } from './entities/weapons/enemySword'
import { Entity } from './entities/entity'
import { ICollidable } from './collision'
import { LevelLoader } from './loader'
import { Sword } from './entities/weapons/sword'

export class Game {
    private readonly _myScreen: IMyScreen
    private readonly _rooms: IRoom[] = []
    private _activeRoom: number
    private readonly _player: IPlayer
    private _respondsToInput: IRespondsToInput[] = []
    private _lastTime = 0
    private _gameState = GameState.Playing
    private _roomTransitionStart: number
    private _targetRoom: number
    private readonly _transitionLength = 0.5
    private _originalActiveRoomLocation: IPoint
    private _originalTargetRoomLocation: IPoint
    private _roomTransitionDirection: Direction

    constructor(canvas: HTMLCanvasElement) {
        // Create screen
        this._myScreen = new MyScreen(canvas)

        // Initialize Player
        this._player = new Player({
            x: this._myScreen.getSize().width / 2,
            y: this._myScreen.getSize().height - 150
        }, this._myScreen)
        const sword = new Sword(this._myScreen)
        sword.attachToCharacter(this._player)
        this._respondsToInput.push(this._player)

        // Load the level
        this.loadLevel()

        // Hook into events
        const eventTarget = document.getElementById('eventTarget')
        eventTarget.addEventListener('onPlayerDeath', (e: CustomEvent) => {
            this.entityDied(e.detail as Entity)
        })
        eventTarget.addEventListener('onEnemyDeath', (e: CustomEvent) => {
            this.entityDied(e.detail as Entity)
        })
        eventTarget.addEventListener('onRoomTransitionTriggered', (e: CustomEvent) => {
            if (this._gameState === GameState.RoomTransition) return
            this.startTransition(e.detail as IRoom)
        })

        // Set initial room to spawn in
        this._activeRoom = 0

        // Activate doors in the spawn room
        const doors = this._rooms[this._activeRoom].getDoors()
        doors.forEach(d => this._respondsToInput.push(d))
    }

    // ----------------------------------------
    //              Update Helpers
    // ----------------------------------------

    public updateTick(time: number): boolean {
        if (this._gameState === GameState.GameOver) {
            alert('Poor Man\'s Game Over')
            return false
        }
        else if (this._gameState === GameState.RoomTransition) {
            if (((Date.now() - this._roomTransitionStart) / 1000) > this._transitionLength) {
                this.endTransition()
            }
            else {
                this._myScreen.clearScreen()
                this.updateTransition()
            }
        }
        else if (this._gameState === GameState.Playing) {
            this._myScreen.clearScreen()
            this.updateEntities(time)
        }

        this._lastTime = time
        return true
    }

    private updateEntities(time: number): void {
        const shapes = this.getCollidableShapes()
        const concerns = this.getConcerns(shapes)
        this.checkForCollisions(concerns)

        const deltaTime = (time - this._lastTime) / 1000.0
        this._rooms[this._activeRoom].update(deltaTime)
        this._player.update(deltaTime)
    }

    // ----------------------------------------
    //              Keyboard Events
    // ----------------------------------------

    public keydown(event: KeyboardEvent): void {
        this._respondsToInput.forEach(responder => {
            switch (event.key) {
                case Keycode.Up:
                case Keycode.W:
                    responder.keyPressed(Keycode.Up)
                    break
                case Keycode.Right:
                case Keycode.D:
                    responder.keyPressed(Keycode.Right)
                    break
                case Keycode.Down:
                case Keycode.S:
                    responder.keyPressed(Keycode.Down)
                    break
                case Keycode.Left:
                case Keycode.A:
                    responder.keyPressed(Keycode.Left)
                    break
                case Keycode.SPACE:
                    responder.keyPressed(Keycode.SPACE)
                    break
                case Keycode.E:
                    responder.keyPressed(Keycode.E)
                    break
            }
        })
    }

    public keyup(event: KeyboardEvent): void {
        this._respondsToInput.forEach(responder => {
            switch (event.key) {
                case Keycode.Up:
                case Keycode.W:
                    responder.keyReleased(Keycode.Up)
                    break
                case Keycode.Right:
                case Keycode.D:
                    responder.keyReleased(Keycode.Right)
                    break
                case Keycode.Down:
                case Keycode.S:
                    responder.keyReleased(Keycode.Down)
                    break
                case Keycode.Left:
                case Keycode.A:
                    responder.keyReleased(Keycode.Left)
                    break
                case Keycode.SPACE:
                    responder.keyReleased(Keycode.SPACE)
                    break
                case Keycode.E:
                    responder.keyReleased(Keycode.E)
                    break
            }
        })
    }

    // ----------------------------------------
    //              Game Events
    // ----------------------------------------

    private entityDied(entity: Entity): void {
        if (entity instanceof Player) {
            this._gameState = GameState.GameOver
        }
        else if (entity instanceof Enemy) {
            this._rooms[this._activeRoom].enemyDied(entity)
        }
    }

    // ----------------------------------------
    //              Collision Helpers
    // ----------------------------------------

    private getCollidableShapes(): {
        wallShapes: ICollidable[],
        doorShapes: ICollidable[],
        roomTransitionShapes: ICollidable[],
        playerShapes: ICollidable[],
        enemyShapes: ICollidable[],
        enemyWeaponShapes: ICollidable[],
        weaponShapes: ICollidable[]
    } {
        const walls = this._rooms[this._activeRoom].getWalls()
        const wallShapes: ICollidable[] = []
        walls.forEach(w => {
            w.getCollisionShapes().forEach(c => wallShapes.push(c))
        })

        const doors = this._rooms[this._activeRoom].getDoors()
        const doorShapes: ICollidable[] = []
        doors.forEach(d => {
            d.getCollisionShapes().forEach(c => doorShapes.push(c))
        })

        const roomTransitions = this._rooms[this._activeRoom].getRoomTransitions()
        const roomTransitionShapes: ICollidable[] = []
        roomTransitions.forEach(rt => {
            rt.getCollisionShapes().forEach(c => roomTransitionShapes.push(c))
        })

        const playerShapes = this._player.getCollisionShapes()

        const enemies = this._rooms[this._activeRoom].getEnemies()
        const enemyShapes: ICollidable[] = []
        const enemyWeaponShapes: ICollidable[] = []

        enemies.forEach(enemy => {
            const enemyCollisions = enemy.getCollisionShapes()
            enemyCollisions.forEach(collision => {
                enemyShapes.push(collision)
            })
            const weapon = enemy.getWeapon()
            const weaponCollisions = weapon.getCollisionShapes()
            weaponCollisions.forEach(collision => {
                enemyWeaponShapes.push(collision)
            })
        })

        const weaponShapes: ICollidable[] = []
        const playerWeapon = this._player.getWeapon()
        const weaponCollisions = playerWeapon.getCollisionShapes()
        weaponCollisions.forEach(collision => {
            weaponShapes.push(collision)
        })

        return {
            wallShapes: wallShapes,
            doorShapes: doorShapes,
            roomTransitionShapes: roomTransitionShapes,
            playerShapes: playerShapes,
            enemyShapes: enemyShapes,
            enemyWeaponShapes: enemyWeaponShapes,
            weaponShapes: weaponShapes
        }
    }

    private getConcerns(
        shapes: {
            wallShapes: ICollidable[],
            doorShapes: ICollidable[],
            roomTransitionShapes: ICollidable[],
            playerShapes: ICollidable[],
            enemyShapes: ICollidable[],
            enemyWeaponShapes: ICollidable[],
            weaponShapes: ICollidable[]
        }
    ): {
        wallConcerns: ICollidable[],
        doorConcerns: ICollidable[],
        roomTransitionConcerns: ICollidable[],
        playerConcerns: ICollidable[],
        enemyConcerns: ICollidable[],
        enemyActivationConcerns: ICollidable[],
        enemyWeaponConcerns: ICollidable[],
        weaponConcerns: ICollidable[]
    } {
        return {
            // Walls care about players and enemies
            wallConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Doors care about players and enemies
            doorConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Room transitions care about players
            roomTransitionConcerns: shapes.playerShapes,
            // Players care about walls, enemies, and enemy weapons
            playerConcerns: shapes.wallShapes.concat(shapes.enemyShapes).concat(shapes.doorShapes).concat(shapes.roomTransitionShapes).concat(shapes.enemyWeaponShapes),
            // Enemies care about walls, players, weapons, and other enemies
            enemyConcerns: shapes.wallShapes.concat(shapes.playerShapes).concat(shapes.weaponShapes).concat(shapes.enemyShapes).concat(shapes.doorShapes),
            // Enemy activations care about players
            enemyActivationConcerns: shapes.playerShapes,
            // Enemy weapons care about players
            enemyWeaponConcerns: shapes.playerShapes,
            // Weapons care about enemies
            weaponConcerns: shapes.enemyShapes
        }
    }

    private checkForCollisions(
        concerns: {
            wallConcerns: ICollidable[],
            doorConcerns: ICollidable[],
            roomTransitionConcerns: ICollidable[],
            playerConcerns: ICollidable[],
            enemyConcerns: ICollidable[],
            enemyActivationConcerns: ICollidable[],
            enemyWeaponConcerns: ICollidable[],
            weaponConcerns: ICollidable[]
        }
    ): void {
        const doors = this._rooms[this._activeRoom].getDoors()
        const walls = this._rooms[this._activeRoom].getWalls()
        const roomTransitions = this._rooms[this._activeRoom].getRoomTransitions()
        const enemies = this._rooms[this._activeRoom].getEnemies()

        walls.forEach(w => w.checkForCollisionsWith(concerns.wallConcerns))
        doors.forEach(d => d.checkForCollisionsWith(concerns.doorConcerns))
        roomTransitions.forEach(rt => rt.checkForCollisionsWith(concerns.roomTransitionConcerns))
        this._player.checkForCollisionsWith(concerns.playerConcerns)
        enemies.forEach(enemy => {
            enemy.checkForCollisionsWith(concerns.enemyConcerns)
            enemy.checkForActivationsWith(concerns.enemyActivationConcerns)
            enemy.getWeapon().checkForCollisionsWith(concerns.enemyWeaponConcerns)
        })
        this._player.getWeapon().checkForCollisionsWith(concerns.weaponConcerns)
    }

    // ----------------------------------------
    //              Room Transition Helpers
    // ----------------------------------------

    private startTransition(targetRoom: IRoom): void {
        this._gameState = GameState.RoomTransition
        this._roomTransitionStart = Date.now()
        this._targetRoom = this._rooms.indexOf(targetRoom)
        this._rooms[this._activeRoom].setRoomState(RoomState.Transitioning)
        this._rooms[this._targetRoom].setRoomState(RoomState.Transitioning)

        const playerLocation = this._player.getLocation()
        if (playerLocation.x < 50) {
            this._roomTransitionDirection = Direction.Left
            this._rooms[this._targetRoom].setLocation({ x: 50 - this._myScreen.getSize().width, y: 50 })
        }
        else if (playerLocation.x > this._myScreen.getSize().width - 50) {
            this._roomTransitionDirection = Direction.Right
            this._rooms[this._targetRoom].setLocation({ x: 50 + this._myScreen.getSize().width, y: 50 })
        }
        else if (playerLocation.y < 50) {
            this._roomTransitionDirection = Direction.Up
            this._rooms[this._targetRoom].setLocation({ x: 50, y: 50 - this._myScreen.getSize().height })
        }
        else if (playerLocation.y > this._myScreen.getSize().height - 50) {
            this._roomTransitionDirection = Direction.Down
            this._rooms[this._targetRoom].setLocation({ x: 50, y: 50 + this._myScreen.getSize().height })
        }

        this._originalActiveRoomLocation = this._rooms[this._activeRoom].getLocation()
        this._originalTargetRoomLocation = targetRoom.getLocation()
    }

    private updateTransition(): void {
        const screenSize = this._myScreen.getSize()

        if (this._roomTransitionDirection === Direction.Up) {
            this._rooms[this._activeRoom].setLocation({ x: this._originalActiveRoomLocation.x, y: this._originalActiveRoomLocation.y + screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
            this._rooms[this._targetRoom].setLocation({ x: this._originalTargetRoomLocation.x, y: this._originalTargetRoomLocation.y + screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
        }
        else if (this._roomTransitionDirection === Direction.Right) {
            this._rooms[this._activeRoom].setLocation({ x: this._originalActiveRoomLocation.x - screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalActiveRoomLocation.y })
            this._rooms[this._targetRoom].setLocation({ x: this._originalTargetRoomLocation.x - screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalTargetRoomLocation.y })
        }
        else if (this._roomTransitionDirection === Direction.Down) {
            this._rooms[this._activeRoom].setLocation({ x: this._originalActiveRoomLocation.x, y: this._originalActiveRoomLocation.y - screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
            this._rooms[this._targetRoom].setLocation({ x: this._originalTargetRoomLocation.x, y: this._originalTargetRoomLocation.y - screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
        }
        else {
            this._rooms[this._activeRoom].setLocation({ x: this._originalActiveRoomLocation.x + screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalActiveRoomLocation.y })
            this._rooms[this._targetRoom].setLocation({ x: this._originalTargetRoomLocation.x + screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalTargetRoomLocation.y })
        }

        this._rooms[this._activeRoom].update()
        this._rooms[this._targetRoom].update()
    }

    private endTransition(): void {
        this._gameState = GameState.Playing
        this._rooms[this._activeRoom].setRoomState(RoomState.Normal)
        this._rooms[this._targetRoom].setRoomState(RoomState.Normal)

        const screenSize = this._myScreen.getSize()
        const roomSize = this._rooms[this._activeRoom].getSize()
        const playerLocation = this._player.getLocation()

        if (playerLocation.x < 50) {
            this._player.setLocation({ x: 50 + roomSize.width - 75, y: 50 + roomSize.height / 2 })
            this._rooms[this._activeRoom].setLocation({ x: 50 - roomSize.width, y: 50 })
        }
        else if (playerLocation.x > screenSize.width - 50) {
            this._player.setLocation({ x: 50 + 75, y: 50 + roomSize.height / 2 })
            this._rooms[this._activeRoom].setLocation({ x: 50 + roomSize.width, y: 50 })
        }
        else if (playerLocation.y < 50) {
            this._player.setLocation({ x: 50 + roomSize.width / 2, y: 50 + roomSize.height - 75 })
            this._rooms[this._activeRoom].setLocation({ x: 50, y: 50 - roomSize.height })
        }
        else if (playerLocation.y > screenSize.height - 50) {
            this._player.setLocation({ x: 50 + roomSize.width / 2, y: 50 + 75 })
            this._rooms[this._activeRoom].setLocation({ x: 50, y: 50 + roomSize.height })
        }

        this._activeRoom = this._targetRoom
        this._targetRoom = null
        this._rooms[this._activeRoom].setLocation({ x: 50, y: 50 })

        this._respondsToInput = []
        this._respondsToInput.push(this._player)
        const doors = this._rooms[this._activeRoom].getDoors()
        doors.forEach(d => this._respondsToInput.push(d))
    }

    // ----------------------------------------
    //              Load Game Helpers
    // ----------------------------------------
    private loadLevel(): void {
        const loadedLevel = LevelLoader.loadLevel()
        const roomMap = new Map<string, IRoom>()

        loadedLevel.rooms.forEach(room => {
            const enemies: IEnemy[] = []
            if (room.enemies) {
                room.enemies.forEach(enemy => {
                    let currentEnemy = null
                    if (enemy.enemyState === 'Moving') {
                        currentEnemy = new Enemy(enemy.location, this._myScreen, EnemyState.Moving)
                    }
                    else if (enemy.enemyState === 'TargetDummy') {
                        currentEnemy = new Enemy(enemy.location, this._myScreen, EnemyState.TargetDummy)
                    }
                    enemies.push(currentEnemy)

                    let weapon = null
                    if (enemy.weapon === 'Claw') {
                        weapon = new Claw(this._myScreen)
                    }
                    else if (enemy.weapon === 'Sword') {
                        weapon = new EnemySword(this._myScreen)
                    }
                    weapon.attachToCharacter(currentEnemy)
                })
            }

            const texts: IText[] = []
            if (room.text) {
                room.text.forEach(text => {
                    texts.push({
                        location: text.location,
                        value: text.value,
                        size: text.size
                    })
                })
            }

            const walls: IWall[] = []
            if(room.walls) {
                room.walls.forEach(wall => {
                    walls.push(new Wall(this._myScreen, wall.location, wall.size))
                })
            }

            const newRoom = new Room(this._myScreen, this._player)
            enemies.forEach(enemy => {
                newRoom.addEnemyToRoom(enemy)
            })
            texts.forEach(text => {
                newRoom.addTextToRoom(text)
            })
            walls.forEach(wall => {
                newRoom.addWallToRoom(wall)
            })
            roomMap.set(room.name, newRoom)
        })

        loadedLevel.rooms.forEach(room => {
            const currentRoom = roomMap.get(room.name)
            room.doors.forEach(d => {
                const targetRoom = roomMap.get(d.toRoom)
                let direction: Direction
                if (d.direction === 'Up') {
                    direction = Direction.Up
                }
                else if (d.direction === 'Right') {
                    direction = Direction.Right
                }
                else if (d.direction === 'Down') {
                    direction = Direction.Down
                }
                else {
                    direction = Direction.Left
                }
                currentRoom.pairWithRoom(direction, targetRoom, d.open)
            })
            this._rooms.push(currentRoom)
        })
    }
}
