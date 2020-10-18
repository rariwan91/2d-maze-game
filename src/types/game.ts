import { Direction, Enemy, Keycodes, MyScreen, Player, Room } from '.'

export class Game {
    private readonly _screen: MyScreen
    private readonly _rooms: Room[] = []
    private readonly _player: Player
    private readonly _enemies: Enemy[] = []
    private _lastTime: number = Date.now()

    constructor(canvas: HTMLCanvasElement) {
        this._screen = new MyScreen(canvas)
        this._rooms.push(new Room(this._screen))
        this._player = new Player({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 26
        }, this._screen)
        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + 26
        }, this._screen))

        this._screen.clearScreen()
    }

    public updateTick(time: number): void {
        this._player.update((time - this._lastTime) / 1000.0)
        this._enemies.forEach(enemy => {
            enemy.update((time - this._lastTime) / 1000.0)
        });
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
