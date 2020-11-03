import { Direction, GameState, IMyScreen, IRespondsToInput, MyScreen } from '.'
import { IPoint, IText, Keycode } from '../gui'
import { ICollidable } from './collision'
import { Enemy, EnemyState, IEnemy, IPlayer, IRoom, IWeapon, Player, Room, RoomState } from './entities'
import { EnemySword } from './entities/enemySword'
import { Entity } from './entities/entity'
import { Sword } from './entities/sword'
import { LevelLoader } from './loader'

export class Game {
    private readonly _myScreen: IMyScreen
    private readonly _rooms: IRoom[] = []
    private _activeRoom: number
    private readonly _player: IPlayer
    private readonly _weapons: IWeapon[] = []
    private readonly _enemyWeapons: IWeapon[] = []
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
        this._myScreen = new MyScreen(canvas)

        this._player = new Player({
            x: this._myScreen.getSize().width / 2,
            y: this._myScreen.getSize().height - 150
        }, this._myScreen)
    
        this._weapons.push(new Sword(this._myScreen))
        this._weapons[0].attachToCharacter(this._player)

        const loadedLevel = LevelLoader.loadLevel()
        if(loadedLevel) {
            const roomMap = new Map<string, IRoom>()

            loadedLevel.rooms.forEach(room => {
                const enemies: IEnemy[] = []
                if(room.enemies) {
                    room.enemies.forEach(enemy => {
                        if(enemy.enemyState === "Moving") {
                            enemies.push(new Enemy(enemy.location, this._myScreen, EnemyState.Moving))
                        }
                        else if(enemy.enemyState === "TargetDummy") {
                            enemies.push(new Enemy(enemy.location, this._myScreen, EnemyState.TargetDummy))
                        }
                    })
                }

                const texts: IText[] = []
                if(room.text) {
                    room.text.forEach(text => {
                        texts.push({
                            location: text.location,
                            value: text.value,
                            size: text.size
                        })
                    })
                }

                const newRoom = new Room(this._myScreen, this._player)
                enemies.forEach(enemy => {
                    const weapon = new EnemySword(this._myScreen)
                    this._enemyWeapons.push(weapon)
                    weapon.attachToCharacter(enemy)
                    newRoom.addEnemyToRoom(enemy)
                })
                texts.forEach(text => {
                    newRoom.addTextToRoom(text)
                })
                roomMap.set(room.name, newRoom)
            })

            loadedLevel.rooms.forEach(room => {
                const currentRoom = roomMap.get(room.name)
                room.doors.forEach(d => {
                    const targetRoom = roomMap.get(d.toRoom)
                    let direction: Direction
                    if(d.direction === "Up") {
                        direction = Direction.Up
                    }
                    else if(d.direction === "Right") {
                        direction = Direction.Right
                    }
                    else if(d.direction === "Down") {
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
        else {
            const centerRoom = new Room(this._myScreen, this._player)
            const northRoom = new Room(this._myScreen, this._player)
            const eastRoom = new Room(this._myScreen, this._player)
            const southRoom = new Room(this._myScreen, this._player)
            const westRoom = new Room(this._myScreen, this._player)
    
            centerRoom.pairWithRoom(Direction.Up, northRoom)
            centerRoom.pairWithRoom(Direction.Down, southRoom)
            centerRoom.pairWithRoom(Direction.Left, westRoom)
            centerRoom.pairWithRoom(Direction.Right, eastRoom)
    
            this._rooms.push(centerRoom, northRoom, eastRoom, southRoom, westRoom)
        }

        const eventTarget = document.getElementById('eventTarget')
        eventTarget.addEventListener('onPlayerDeath', (e: CustomEvent) => {
            this.entityDied(e.detail)
        })
        eventTarget.addEventListener('onEnemyDeath', (e: CustomEvent) => {
            this.entityDied(e.detail)
        })
        eventTarget.addEventListener('onRoomTransitionTriggered', (e: CustomEvent) => {
            if (this._gameState === GameState.RoomTransition) return
            this.startTransition(e.detail)
        })

        this._respondsToInput.push(this._player)
        this._activeRoom = 0
        const doors = this._rooms[this._activeRoom].getDoors()
        doors.forEach(d => this._respondsToInput.push(d))

        this._myScreen.clearScreen()
    }

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

        this._rooms[this._activeRoom].update((time - this._lastTime) / 1000.0)
        this._player.update((time - this._lastTime) / 1000.0)
    }

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

    private entityDied(entity: Entity): void {
        if (entity instanceof Player) {
            this._gameState = GameState.GameOver
        }
        else if (entity instanceof Enemy) {
            this._rooms[this._activeRoom].enemyDied(entity)
        }
    }

    private getCollidableShapes(): {
        roomShapes: ICollidable[],
        doorShapes: ICollidable[],
        roomTransitionShapes: ICollidable[],
        playerShapes: ICollidable[],
        enemyShapes: ICollidable[],
        enemyWeaponShapes: ICollidable[],
        weaponShapes: ICollidable[]
    } {
        const roomShapes = this._rooms[this._activeRoom].getCollisionShapes()

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

        enemies.forEach(enemy => {
            const enemyCollisions = enemy.getCollisionShapes()
            enemyCollisions.forEach(collision => {
                enemyShapes.push(collision)
            })
            const enemyActivations = enemy.getActivationShapes()
            enemyActivations.forEach(activation => {
                enemyActivations.push(activation)
            })
        })

        const enemyWeaponShapes: ICollidable[] = []
        this._enemyWeapons.forEach(weapon => {
            const weaponCollisions = weapon.getCollisionShapes()
            weaponCollisions.forEach(collision => {
                enemyWeaponShapes.push(collision)
            })
        })

        const weaponShapes: ICollidable[] = []
        this._weapons.forEach(weapon => {
            const weaponCollisions = weapon.getCollisionShapes()
            weaponCollisions.forEach(collision => {
                weaponShapes.push(collision)
            })
        })

        return {
            roomShapes: roomShapes,
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
            roomShapes: ICollidable[],
            doorShapes: ICollidable[],
            roomTransitionShapes: ICollidable[],
            playerShapes: ICollidable[],
            enemyShapes: ICollidable[],
            enemyWeaponShapes: ICollidable[],
            weaponShapes: ICollidable[]
        }
    ): {
        roomConcerns: ICollidable[],
        doorConcerns: ICollidable[],
        roomTransitionConcerns: ICollidable[],
        playerConcerns: ICollidable[],
        enemyConcerns: ICollidable[],
        enemyActivationConcerns: ICollidable[],
        enemyWeaponConcerns: ICollidable[],
        weaponConcerns: ICollidable[]
    } {
        return {
            // Rooms care about players and enemies
            roomConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Doors care about players and enemies
            doorConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Room transitions care about players
            roomTransitionConcerns: shapes.playerShapes,
            // Players care about rooms, enemies, and enemy weapons
            playerConcerns: shapes.roomShapes.concat(shapes.enemyShapes).concat(shapes.doorShapes).concat(shapes.roomTransitionShapes).concat(shapes.enemyWeaponShapes),
            // Enemies care about rooms, players, weapons, and other enemies
            enemyConcerns: shapes.roomShapes.concat(shapes.playerShapes).concat(shapes.weaponShapes).concat(shapes.enemyShapes).concat(shapes.doorShapes),
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
            roomConcerns: ICollidable[],
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
        const roomTransitions = this._rooms[this._activeRoom].getRoomTransitions()
        const enemies = this._rooms[this._activeRoom].getEnemies()

        this._rooms[this._activeRoom].checkForCollisionsWith(concerns.roomConcerns)
        doors.forEach(d => d.checkForCollisionsWith(concerns.doorConcerns))
        roomTransitions.forEach(rt => rt.checkForCollisionsWith(concerns.roomTransitionConcerns))
        this._player.checkForCollisionsWith(concerns.playerConcerns)
        enemies.forEach(enemy => {
            enemy.checkForCollisionsWith(concerns.enemyConcerns)
            enemy.checkForActivationsWith(concerns.enemyActivationConcerns)
        })
        this._enemyWeapons.forEach(weapon => weapon.checkForCollisionsWith(concerns.enemyWeaponConcerns))
        this._weapons.forEach(weapon => weapon.checkForCollisionsWith(concerns.weaponConcerns))
    }

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
}
