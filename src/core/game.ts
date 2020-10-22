import { Enemy, EnemyState, IEnemy, IPlayer, IWeapon, MyScreen, Player, Room, Sword } from '.'
import { Keycode } from '../gui'
import { ICollidable } from './collision'
import { Direction } from './direction.enum'
import { Entity } from './entity'

export class Game {
    private readonly _myScreen: MyScreen
    private readonly _rooms: Room[] = []
    private _activeRoom: Room
    private readonly _player: IPlayer
    private readonly _enemies: IEnemy[] = []
    private readonly _weapons: IWeapon[] = []
    private _lastTime: number = 0
    private _gameOver = false

    constructor(canvas: HTMLCanvasElement) {
        this._myScreen = new MyScreen(canvas)
        const roomCenter = new Room(this._myScreen)
        const roomUp = new Room(this._myScreen)
        const roomRight = new Room(this._myScreen)
        const roomDown = new Room(this._myScreen)
        const roomLeft = new Room(this._myScreen)
        roomCenter.pairWithRoom(Direction.Up, roomUp)
        roomCenter.pairWithRoom(Direction.Down, roomDown)
        roomCenter.pairWithRoom(Direction.Left, roomLeft)
        roomCenter.pairWithRoom(Direction.Right, roomRight)

        this._rooms.push(roomCenter, roomUp, roomRight, roomDown, roomLeft)
        this._activeRoom = this._rooms[0]

        this._weapons.push(new Sword(this._myScreen))

        this._player = new Player({
            x: this._rooms[0].getLocation().x + this._rooms[0].getSize().width / 2,
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 40
        }, this._myScreen)

        this._player.registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        // These enemies will chase you down. This is annoying when I'm trying to test
        // something other than that.
        // this.createEnemies()

        // These enemies will just stand there.
        this.createEnemies(EnemyState.TargetDummy)

        this._weapons[0].attachToPlayer(this._player)

        this._myScreen.clearScreen()
    }

    public updateTick(time: number): boolean {
        if (this._gameOver) {
            alert('Poor Man\'s Game Over')
            return false
        }
        this._myScreen.clearScreen()
        this.updateEntities(time)

        this._lastTime = time
        return true
    }

    private updateEntities(time: number): void {
        const roomCollidables = this._activeRoom.getCollisionShapes()
        const playerCollidables = this._player.getCollisionShapes()

        const enemyCollidables: ICollidable[] = []
        const playerWeaponCollidables: ICollidable[] = []

        this._enemies.forEach(enemy => {
            const enemyCollisions = enemy.getCollisionShapes()
            enemyCollisions.forEach(collision => {
                enemyCollidables.push(collision)
            });
        });

        this._weapons.forEach(weapon => {
            const weaponCollisions = weapon.getCollisionShapes()
            weaponCollisions.forEach(collision => {
                playerWeaponCollidables.push(collision)
            })
        })

        // Have player check for collisions with room and enemies
        this._player.checkForCollisionsWith(roomCollidables.concat(enemyCollidables))

        // Have enemies check for collisions with room, player, player weapons, and other enemies
        const enemyConcerns = roomCollidables.concat(playerCollidables).concat(playerWeaponCollidables).concat(enemyCollidables)
        this._enemies.forEach(enemy => {
            enemy.checkForCollisionsWith(enemyConcerns)
        })

        // Have rooms check for collisions with players and enemies
        const roomConcerns = playerCollidables.concat(enemyCollidables)
        this._activeRoom.checkForCollisionsWith(roomConcerns)

        // Have player weapons check for collisions with enemies
        this._weapons.forEach(weapon => {
            weapon.checkForCollisionsWith(enemyCollidables)
        })

        // Have the entities update now that collision has been updated
        this._player.update((time - this._lastTime) / 1000.0)
        this._enemies.forEach(enemy => {
            enemy.aiTick()
            enemy.update((time - this._lastTime) / 1000.0)
        })
        this._activeRoom.update()
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

        this._enemies[0].registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        this._enemies[1].registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        this._enemies[2].registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        this._enemies[3].registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        this._enemies[4].registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })
    }

    private entityDied(entity: Entity): void {
        if (entity instanceof Player) {
            this._gameOver = true
        }
        else if (entity instanceof Enemy) {
            const index = this._enemies.indexOf(entity)
            this._enemies.splice(index, 1)
        }
    }

    public gameOver(): void {
        this._gameOver = true
    }
}
