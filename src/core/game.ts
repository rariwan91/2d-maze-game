import { IRespondsToInput, MyScreen } from '.'
import { Enemy, EnemyState, IEnemy, IPlayer, IWeapon, Player, Room } from './entities'
import { Entity } from './entities/entity'
import { Sword } from './entities/sword'
import { Keycode } from '../gui'
import { ICollidable } from './collision'
import { Direction } from './direction.enum'

export class Game {
    private readonly _myScreen: MyScreen
    private readonly _rooms: Room[] = []
    private _activeRoom: Room
    private readonly _player: IPlayer
    private readonly _enemies: IEnemy[] = []
    private readonly _weapons: IWeapon[] = []
    private readonly _respondsToInput: IRespondsToInput[] = []
    private _lastTime: number = 0
    private _gameOver = false

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
            y: this._rooms[0].getLocation().y + this._rooms[0].getSize().height - 50
        }, this._myScreen)

        this._player.registerOnDeathEvent((entity: Entity): void => {
            this.entityDied(entity)
        })

        this._respondsToInput.push(this._player, this._activeRoom)

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
                case Keycode.ENTER:
                    responder.keyPressed(Keycode.ENTER)
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
