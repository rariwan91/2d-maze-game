import { Direction, Enemy, MyScreen, Player, Room } from '.'
import { Keycodes } from '../gui'

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
            case Keycodes.Up:
            case Keycodes.W:
                this._player.directionPressed(Direction.Up)
                break
            case Keycodes.Right:
            case Keycodes.D:
                this._player.directionPressed(Direction.Right)
                break
            case Keycodes.Down:
            case Keycodes.S:
                this._player.directionPressed(Direction.Down)
                break
            case Keycodes.Left:
            case Keycodes.A:
                this._player.directionPressed(Direction.Left)
                break
        }
    }

    public keyup(event: KeyboardEvent): void {
        switch (event.key) {
            case Keycodes.Up:
            case Keycodes.W:
                this._player.directionReleased(Direction.Up)
                break
            case Keycodes.Right:
            case Keycodes.D:
                this._player.directionReleased(Direction.Right)
                break
            case Keycodes.Down:
            case Keycodes.S:
                this._player.directionReleased(Direction.Down)
                break
            case Keycodes.Left:
            case Keycodes.A:
                this._player.directionReleased(Direction.Left)
                break
        }
    }
}
