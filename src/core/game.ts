import { Enemy, IPlayer, IWeapon, MyScreen, Player, Room, Sword } from '.'
import { Keycode } from '../gui'
import { ICollidable } from './collision'
import { Entity } from './entity'

export class Game {
    private readonly _myScreen: MyScreen
    private readonly _rooms: Room[] = []
    private _activeRoom: Room
    private readonly _player: IPlayer
    private readonly _enemies: Enemy[] = []
    private readonly _weapons: IWeapon[] = []
    private _lastTime: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this._myScreen = new MyScreen(canvas)
        this._rooms.push(new Room(this._myScreen))
        this._activeRoom = this._rooms[0]

        this._weapons.push(new Sword(this._myScreen))

        this._player = new Player({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 40
        }, this._myScreen)

        this._enemies.push(new Enemy({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height / 2
        }, this._myScreen))

        this._weapons[0].attachToPlayer(this._player)

        this._myScreen.clearScreen()
    }

    public updateTick(time: number): void {
        this._myScreen.clearScreen()

        const roomCollisionShapes = this._activeRoom.getCollisionShapes()
        const playerCollisionShapes = this._player.getCollisionShapes()
        const enemyCollisionShapes = this._enemies[0].getCollisionShapes()
        const playerWeaponCollisionShapes = this._weapons[0].getCollisionShapes()

        const roomCollisions = playerCollisionShapes[0].isCollidingWithShapes(roomCollisionShapes)
        const enemiesCollidingWithPlayer = playerCollisionShapes[0].isCollidingWithShapes(enemyCollisionShapes)
        const enemiesCollidingWithPlayerWeapons = new Map<Entity, ICollidable>()
        playerWeaponCollisionShapes.forEach((weaponShape) => {
            const enemiesCollidingWithCurrentPlayerWeapon = weaponShape.isCollidingWithShapes(enemyCollisionShapes)
            enemiesCollidingWithCurrentPlayerWeapon.forEach(enemyShape => {
                if(!enemiesCollidingWithPlayerWeapons.has(enemyShape.getEntity())) {
                    enemiesCollidingWithPlayerWeapons.set(enemyShape.getEntity(), weaponShape)
                }
            })
        })
        if(enemiesCollidingWithPlayerWeapons.size > 0) {
            console.log('informing enemy and weapon of collision')
            this._enemies[0].collisionStarted(playerWeaponCollisionShapes)
            this._weapons[0].collisionStarted(enemyCollisionShapes)
        }
        else {
            this._weapons[0].collisionEnded()
        }

        if (roomCollisions && roomCollisions.length > 0) {
            this._player.collisionStarted(roomCollisions)
            this._activeRoom.collisionStarted(playerCollisionShapes)
        }
        else {
            this._activeRoom.collisionEnded()
        }

        if (enemiesCollidingWithPlayer && enemiesCollidingWithPlayer.length > 0) {
            this._player.collisionStarted(enemiesCollidingWithPlayer)
            this._enemies[0].collisionStarted(playerCollisionShapes)
        }

        if(enemiesCollidingWithPlayerWeapons.size < 1 && (!enemiesCollidingWithPlayer || enemiesCollidingWithPlayer.length < 1)) {
            this._enemies[0].collisionEnded()
        }

        if ((!roomCollisions || roomCollisions.length < 1) && (!enemiesCollidingWithPlayer || enemiesCollidingWithPlayer.length < 1)) {
            this._player.collisionEnded()
        }

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
