import { Direction, GameState, IRespondsToInput, MyScreen } from '.'
import { IPoint, Keycode } from '../gui'
import { ICollidable } from './collision'
import { Enemy, EnemyState, IEnemy, IPlayer, IRoom, IWeapon, Player, Room } from './entities'
import { Entity } from './entities/entity'
import { Sword } from './entities/sword'

export class Game {
    private readonly _myScreen: MyScreen
    private readonly _rooms: IRoom[] = []
    private _activeRoom: IRoom
    private readonly _player: IPlayer
    private readonly _enemies: IEnemy[] = []
    private readonly _weapons: IWeapon[] = []
    private _respondsToInput: IRespondsToInput[] = []
    private _lastTime = 0
    private _gameState = GameState.Playing
    private _roomTransitionStart: number
    private _targetRoom: IRoom
    private readonly _transitionLength = 0.5
    private _originalActiveRoomLocation: IPoint
    private _originalTargetRoomLocation: IPoint
    private _roomTransitionDirection: Direction

    constructor(canvas: HTMLCanvasElement) {
        this._myScreen = new MyScreen(canvas)

        const centerRoom = new Room(this._myScreen)
        const northRoom = new Room(this._myScreen)
        const eastRoom = new Room(this._myScreen)
        const southRoom = new Room(this._myScreen)
        const westRoom = new Room(this._myScreen)

        centerRoom.pairWithRoom(Direction.Up, northRoom)
        centerRoom.pairWithRoom(Direction.Down, southRoom)
        centerRoom.pairWithRoom(Direction.Left, westRoom)
        centerRoom.pairWithRoom(Direction.Right, eastRoom)

        this._rooms.push(centerRoom, northRoom, eastRoom, southRoom, westRoom)
        this._activeRoom = this._rooms[0]

        this._weapons.push(new Sword(this._myScreen))

        this._player = new Player({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 75
        }, this._myScreen)

        const eventTarget = document.getElementById('eventTarget')
        eventTarget.addEventListener('onPlayerDeath', (e: CustomEvent) => {
            this.entityDied(e.detail)
        })
        eventTarget.addEventListener('onEnemyDeath', (e: CustomEvent) => {
            this.entityDied(e.detail)
        })
        eventTarget.addEventListener('onRoomTransitionTriggered', (e: CustomEvent) => {
            if(this._gameState === GameState.RoomTransition) return

            this._gameState = GameState.RoomTransition
            this._roomTransitionStart = Date.now()
            this._targetRoom = e.detail

            const playerLocation = this._player.getLocation()
            if(playerLocation.x < 50) {
                this._roomTransitionDirection = Direction.Left
                this._targetRoom.setLocation({ x: 50 - this._myScreen.getSize().width, y: 50 })
            }
            else if(playerLocation.x > this._myScreen.getSize().width - 50) {
                this._roomTransitionDirection = Direction.Right
                this._targetRoom.setLocation({ x: 50 + this._myScreen.getSize().width, y: 50 })
            }
            else if(playerLocation.y < 50) {
                this._roomTransitionDirection = Direction.Up
                this._targetRoom.setLocation({ x: 50, y: 50 - this._myScreen.getSize().height })
            }
            else if(playerLocation.y > this._myScreen.getSize().height - 50) {
                this._roomTransitionDirection = Direction.Down
                this._targetRoom.setLocation({ x: 50, y: 50 + this._myScreen.getSize().height })
            }

            this._originalActiveRoomLocation = this._activeRoom.getLocation()
            this._originalTargetRoomLocation = this._targetRoom.getLocation()
        })

        this._respondsToInput.push(this._player)
        const doors = this._activeRoom.getDoors()
        doors.forEach(d => this._respondsToInput.push(d))

        // These enemies will chase you down. This is annoying when I'm trying to test
        // something other than that.
        // this.createEnemies()

        // These enemies will just stand there.
        this.createEnemies(EnemyState.TargetDummy)

        this._weapons[0].attachToPlayer(this._player)

        this._myScreen.clearScreen()
    }

    public updateTick(time: number): boolean {
        if (this._gameState === GameState.GameOver) {
            alert('Poor Man\'s Game Over')
            return false
        }
        else if (this._gameState === GameState.RoomTransition) {
            if (((Date.now() - this._roomTransitionStart) / 1000) > this._transitionLength) {
                this._gameState = GameState.Playing
                this._activeRoom = this._targetRoom
                this._targetRoom = null
                this._activeRoom.setLocation({x: 50, y: 50 })

                const screenSize = this._myScreen.getSize()
                const roomLocation = this._activeRoom.getLocation()
                const roomSize = this._activeRoom.getSize()
                const playerLocation = this._player.getLocation()

                if(playerLocation.x < 50) {
                    this._player.setLocation({ x: roomLocation.x + roomSize.width - 75, y: roomLocation.y + roomSize.height / 2 })
                }
                else if(playerLocation.x > screenSize.width - 50) {
                    this._player.setLocation({ x: roomLocation.x + 75, y: roomLocation.y + roomSize.height / 2 })
                }
                else if(playerLocation.y < 50) {
                    this._player.setLocation({ x: roomLocation.x + roomSize.width / 2, y: roomLocation.y + roomSize.height - 75 })
                }
                else if(playerLocation.y > screenSize.height - 50) {
                    this._player.setLocation({ x: roomLocation.x + roomSize.width / 2, y: roomLocation.y + 75 })
                }

                this._respondsToInput = []
                this._respondsToInput.push(this._player)
                const doors = this._activeRoom.getDoors()
                doors.forEach(d => this._respondsToInput.push(d))
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

        this._activeRoom.update()
        this._enemies.forEach(enemy => {
            enemy.aiTick()
            enemy.update((time - this._lastTime) / 1000.0)
        })
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

    private createEnemies(initialEnemyState = EnemyState.Moving): void {
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen, this._player, initialEnemyState))
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2 - 75,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen, this._player, initialEnemyState))
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2 - 150,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen, this._player, initialEnemyState))
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2 + 75,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen, this._player, initialEnemyState))
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2 + 150,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen, this._player, initialEnemyState))
    }

    private entityDied(entity: Entity): void {
        if (entity instanceof Player) {
            this._gameState = GameState.GameOver
        }
        else if (entity instanceof Enemy) {
            const index = this._enemies.indexOf(entity)
            this._enemies.splice(index, 1)
        }
    }

    private getCollidableShapes(): {
        roomShapes: ICollidable[],
        doorShapes: ICollidable[],
        roomTransitionShapes: ICollidable[],
        playerShapes: ICollidable[],
        enemyShapes: ICollidable[],
        weaponShapes: ICollidable[]
    } {
        const roomShapes = this._activeRoom.getCollisionShapes()

        const doors = this._activeRoom.getDoors()
        const doorShapes: ICollidable[] = []
        doors.forEach(d => {
            d.getCollisionShapes().forEach(c => doorShapes.push(c))
        })

        const roomTransitions = this._activeRoom.getRoomTransitions()
        const roomTransitionShapes: ICollidable[] = []
        roomTransitions.forEach(rt => {
            rt.getCollisionShapes().forEach(c => roomTransitionShapes.push(c))
        })

        const playerShapes = this._player.getCollisionShapes()

        const enemyShapes: ICollidable[] = []

        this._enemies.forEach(enemy => {
            const enemyCollisions = enemy.getCollisionShapes()
            enemyCollisions.forEach(collision => {
                enemyShapes.push(collision)
            });
        });

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
            weaponShapes: ICollidable[]
        }
    ): {
        roomConcerns: ICollidable[],
        doorConcerns: ICollidable[],
        roomTransitionConcerns: ICollidable[],
        playerConcerns: ICollidable[],
        enemyConcerns: ICollidable[],
        weaponConcerns: ICollidable[]
    } {
        return {
            // Rooms care about players and enemies
            roomConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Doors care about players and enemies
            doorConcerns: shapes.playerShapes.concat(shapes.enemyShapes),
            // Room transitions care about players
            roomTransitionConcerns: shapes.playerShapes,
            // Players care about rooms and enemies
            playerConcerns: shapes.roomShapes.concat(shapes.enemyShapes).concat(shapes.doorShapes).concat(shapes.roomTransitionShapes),
            // Enemies care about rooms, players, weapons, and other enemies
            enemyConcerns: shapes.roomShapes.concat(shapes.playerShapes).concat(shapes.weaponShapes).concat(shapes.enemyShapes).concat(shapes.doorShapes),
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
            weaponConcerns: ICollidable[]
        }
    ): void {
        const doors = this._activeRoom.getDoors()
        const roomTransitions = this._activeRoom.getRoomTransitions()

        this._activeRoom.checkForCollisionsWith(concerns.roomConcerns)
        doors.forEach(d => d.checkForCollisionsWith(concerns.doorConcerns))
        roomTransitions.forEach(rt => rt.checkForCollisionsWith(concerns.roomTransitionConcerns))
        this._player.checkForCollisionsWith(concerns.playerConcerns)
        this._enemies.forEach(enemy => enemy.checkForCollisionsWith(concerns.enemyConcerns))
        this._weapons.forEach(weapon => weapon.checkForCollisionsWith(concerns.weaponConcerns))
    }

    private updateTransition(): void {
        const screenSize = this._myScreen.getSize()

        if(this._roomTransitionDirection === Direction.Up) {
            this._activeRoom.setLocation({x: this._originalActiveRoomLocation.x, y: this._originalActiveRoomLocation.y + screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
            this._targetRoom.setLocation({x: this._originalTargetRoomLocation.x, y: this._originalTargetRoomLocation.y + screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
        }
        else if(this._roomTransitionDirection === Direction.Right) {
            this._activeRoom.setLocation({x: this._originalActiveRoomLocation.x - screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalActiveRoomLocation.y })
            this._targetRoom.setLocation({x: this._originalTargetRoomLocation.x - screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalTargetRoomLocation.y })
        }
        else if(this._roomTransitionDirection === Direction.Down) {
            this._activeRoom.setLocation({x: this._originalActiveRoomLocation.x, y: this._originalActiveRoomLocation.y - screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
            this._targetRoom.setLocation({x: this._originalTargetRoomLocation.x, y: this._originalTargetRoomLocation.y - screenSize.height * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength })
        }
        else {
            this._activeRoom.setLocation({x: this._originalActiveRoomLocation.x + screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalActiveRoomLocation.y })
            this._targetRoom.setLocation({x: this._originalTargetRoomLocation.x + screenSize.width * ((Date.now() - this._roomTransitionStart) / 1000) / this._transitionLength, y: this._originalTargetRoomLocation.y })
        }

        this._activeRoom.update((Date.now() - this._lastTime) / 1000)
        this._targetRoom.update((Date.now() - this._lastTime) / 1000)
    }
}
