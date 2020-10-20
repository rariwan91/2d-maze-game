import { Enemy } from './enemy'
import { MyScreen } from './myScreen'
import { Player } from './player'
import { Room } from './room'
import { Keycode } from '../gui/keycode.enum'

export class Game {
    private readonly _screen: MyScreen
    private readonly _rooms: Room[] = []
    private _activeRoom: Room
    private readonly _player: Player
    private readonly _enemies: Enemy[] = []
    private _lastTime: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this._screen = new MyScreen(canvas)
        this._rooms.push(new Room(this._screen))
        this._activeRoom = this._rooms[0]
        this._player = new Player({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 40
        }, this._screen)
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._screen))

        this._screen.clearScreen()
        this._enemies[0].draw()
    }

    public updateTick(time: number): void {
        const roomCollisionShapes = this._activeRoom.getCollisionShapes()
        const playerCollisionShapes = this._player.getCollisionShapes()
        const enemyCollisionShapes = this._enemies[0].getCollisionShapes()

        const roomCollisions = playerCollisionShapes[0].isCollidingWithShapes(roomCollisionShapes)
        const enemyCollisions = playerCollisionShapes[0].isCollidingWithShapes(enemyCollisionShapes)
        if (roomCollisions && roomCollisions.length > 0) {
            this._player.collisionStarted(roomCollisions)
            this._activeRoom.collisionStarted(playerCollisionShapes)
        }
        else {
            this._activeRoom.collisionEnded()
        }

        if (enemyCollisions && enemyCollisions.length > 0) {
            this._player.collisionStarted(enemyCollisions)
            this._enemies[0].collisionStarted(playerCollisionShapes)
        }
        else {
            this._enemies[0].collisionEnded()
        }

        if ((!roomCollisions || roomCollisions.length < 1) && (!enemyCollisions || enemyCollisions.length < 1)) {
            this._player.collisionEnded()
        }

        this._enemies.forEach(enemy => {
            enemy.clearOld()
        })
        this._player.clearOld()
        this._rooms[0].clearOld()

        this._player.update((time - this._lastTime) / 1000.0)
        this._enemies.forEach(enemy => {
            enemy.aiTick(this._player)
            enemy.update((time - this._lastTime) / 1000.0)
        })
        this._rooms[0].update()
        this._lastTime = time
    }

    public keydown(event: KeyboardEvent): void {
        switch (event.key) {
            case Keycode.Up:
            case Keycode.W:
                this._player.keyPressed(Keycode.Up)
                break
            case Keycode.Right:
            case Keycode.D:
                this._player.keyPressed(Keycode.Right)
                break
            case Keycode.Down:
            case Keycode.S:
                this._player.keyPressed(Keycode.Down)
                break
            case Keycode.Left:
            case Keycode.A:
                this._player.keyPressed(Keycode.Left)
                break
            case Keycode.SPACE:
                this._player.keyPressed(Keycode.SPACE)
                break
        }
    }

    public keyup(event: KeyboardEvent): void {
        switch (event.key) {
            case Keycode.Up:
            case Keycode.W:
                this._player.keyReleased(Keycode.Up)
                break
            case Keycode.Right:
            case Keycode.D:
                this._player.keyReleased(Keycode.Right)
                break
            case Keycode.Down:
            case Keycode.S:
                this._player.keyReleased(Keycode.Down)
                break
            case Keycode.Left:
            case Keycode.A:
                this._player.keyReleased(Keycode.Left)
                break
            case Keycode.SPACE:
                this._player.keyReleased(Keycode.SPACE)
                break
        }
    }
}
