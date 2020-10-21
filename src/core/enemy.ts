import { Direction, EnemyState, IEnemy, IMyScreen, IPlayer, Room, WeaponState } from '.'
import { Colors, IPoint } from '../gui'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar } from '../helpers'
import { CollisionConfig, EnemyCollision, ICollidable } from './collision'
import { Entity } from './entity'
import { Weapon } from './weapon'

export class Enemy extends Entity implements IEnemy {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number = 25
    private _direction = Direction.Down
    private readonly _myScreen: IMyScreen
    private _collisionShape: EnemyCollision
    private readonly _mainColor = Colors.Red
    private readonly _secondaryColor = Colors.Green
    private readonly _yesCollisionColor = Colors.Red
    private readonly _noCollisionColor = Colors.Green
    private readonly _invincibleColor = Colors.Blue
    private readonly _movementSpeed = 50
    private readonly _knockbackSpeed = 200
    private _maxHealth: number = 100
    private _currentHealth: number = 100
    private _state = EnemyState.TargetDummy
    private _oldState = EnemyState.TargetDummy
    private _knockbackAngle: number
    private readonly _player: IPlayer
    private _entitiesCollidingWithMe: Entity[] = []
    private _lastTookDamage: number
    private readonly _deathEventListeners: ((entity: Entity) => void)[] = []

    constructor(location: IPoint, myScreen: IMyScreen, player: IPlayer, initialState: EnemyState = EnemyState.Moving) {
        super()
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionShape = new EnemyCollision(location, this._radius + 3, this)
        this._player = player
        this._state = initialState
        this._oldState = initialState
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, this._mainColor, this._secondaryColor)

        if (CollisionConfig && CollisionConfig.Enemies.ShowCollisionBoxes) {
            if (this._state === EnemyState.Moving || this._state === EnemyState.Stopped || this._state === EnemyState.TargetDummy) {
                drawCollision(this._myScreen, this._collisionShape.getLocation(), this._collisionShape.getRadius(), this._yesCollisionColor, this._noCollisionColor, this.isColliding())
            }
            else if (this._state === EnemyState.KnockbackFromDamage || this._state === EnemyState.InvincibleDueToDamage) {
                drawCollision(this._myScreen, this._collisionShape.getLocation(), this._collisionShape.getRadius(), this._invincibleColor, this._invincibleColor, this.isColliding())
            }
        }

        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Room) {
                this._location = this._oldLocation
            }
            else if (entity instanceof Weapon) {
                if ((entity.getState() === WeaponState.Swinging || entity.getState() === WeaponState.ReturnSwinging) && (this._state === EnemyState.Moving || this._state === EnemyState.Stopped || this._state === EnemyState.TargetDummy)) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                    const theirLoc = this._player.getLocation()
                    const myLoc = this._location
                    const deltaX = myLoc.x - theirLoc.x
                    const deltaY = myLoc.y - theirLoc.y

                    let angle = Math.atan(-deltaY / deltaX) * 180.0 / Math.PI
                    if (deltaX < 0 && deltaY < 0) {
                        angle = 180 + angle
                    }
                    else if (deltaX < 0 && deltaY > 0) {
                        angle = angle - 180
                    }

                    this._oldState = this._state
                    this._state = EnemyState.KnockbackFromDamage
                    this._knockbackAngle = angle
                }
            }
        })

        this.calculateLocation(deltaTime)
        this._collisionShape.setLocation(this._location)
        this.draw()
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionShape]
    }

    public checkForCollisionsWith(shapes: ICollidable[]): void {
        const collidingShapes = this._collisionShape.isCollidingWithShapes(shapes)
        const collidingEntities: Entity[] = []
        collidingShapes.forEach(collidable => {
            const entity = collidable.getEntity()
            if (!collidingEntities.includes(entity)) {
                collidingEntities.push(entity)
            }
        })
        this._entitiesCollidingWithMe = collidingEntities
    }

    // ----------------------------------------
    //              IHasAI
    // ----------------------------------------

    public aiTick(): void {
        if (this._state === EnemyState.KnockbackFromDamage) {
            if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= 0.25) {
                this._state = EnemyState.InvincibleDueToDamage
            }
            return
        }

        if (this._state === EnemyState.InvincibleDueToDamage) {
            if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= 0.5) {
                this._state = this._oldState
            }
            return
        }

        const myLoc = this._location
        const pLoc = this._player.getLocation()
        const deltaY = pLoc.y - myLoc.y
        const deltaX = pLoc.x - myLoc.x
        let angle = Math.atan(-deltaY / deltaX) * 180 / Math.PI

        // player is down and to the right of me
        if (deltaX > 0 && deltaY > 0) {
            angle = 360 + angle
        }
        // player is up and to the right of me
        else if (deltaX > 0 && deltaY < 0) {
            // do nothing
        }
        // player is down and to the left of me
        else if (deltaX < 0 && deltaY > 0) {
            angle = 180 + angle
        }
        // player is up and to the left of me
        else if (deltaX < 0 && deltaY < 0) {
            angle = 180 + angle
        }
        else if (deltaX === 0 && deltaY > 0) {
            angle = 270
        }
        else if (deltaX === 0 && deltaY < 0) {
            angle = 90
        }
        else if (deltaY === 0 && deltaX > 0) {
            angle = 0
        }
        else if (deltaY === 0 && deltaX < 0) {
            angle = 180
        }

        if (angle < 22.5 || angle >= 337.5) {
            this._direction = Direction.Right
        }
        else if (angle >= 22.5 && angle < 67.5) {
            this._direction = Direction.UpRight
        }
        else if (angle >= 67.5 && angle < 112.5) {
            this._direction = Direction.Up
        }
        else if (angle >= 112.5 && angle < 157.5) {
            this._direction = Direction.UpLeft
        }
        else if (angle >= 157.5 && angle < 202.5) {
            this._direction = Direction.Left
        }
        else if (angle >= 202.5 && angle < 247.5) {
            this._direction = Direction.DownLeft
        }
        else if (angle >= 247.5 && angle < 292.5) {
            this._direction = Direction.Down
        }
        else if (angle >= 292.5 && angle < 337.5) {
            this._direction = Direction.DownRight
        }

        if (this._state !== EnemyState.TargetDummy) {
            if (Math.pow(deltaY, 2) + Math.pow(deltaX, 2) < Math.pow(this._radius + this._player.getRadius(), 2)) {
                this._state = EnemyState.Stopped
            }
            else {
                this._state = EnemyState.Moving
            }
        }
    }

    // ----------------------------------------
    //              IHasHealth
    // ----------------------------------------

    public getMaxHealth(): number {
        return this._maxHealth
    }

    public getCurrentHealth(): number {
        return this._currentHealth
    }

    public takeDamage(amount: number): void {
        this._currentHealth = Math.max(this._currentHealth - amount, 0)
        if (this._currentHealth <= 0) {
            this._deathEventListeners.forEach(callback => callback(this))
        }
    }

    public registerOnDeathEvent(callback: (entity: Entity) => void): void {
        this._deathEventListeners.push(callback)
    }

    public unregisterOnDeathEvent(callback: (entity: Entity) => void): void {
        if (this._deathEventListeners.includes(callback)) {
            const index = this._deathEventListeners.indexOf(callback)
            this._deathEventListeners.splice(index)
        }
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private calculateLocation(deltaTime: number): void {
        if (this._state === EnemyState.Moving) {
            const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
            const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)
            this._oldLocation = this._location
            this._location = newLocation
        }
        else if (this._state === EnemyState.KnockbackFromDamage) {
            const myLoc = this._location

            let newVelocity: IPoint = {
                x: this._knockbackSpeed * Math.cos(this._knockbackAngle * Math.PI / 180.0),
                y: this._knockbackSpeed * Math.sin(this._knockbackAngle * Math.PI / 180.0)
            }
            let newLocation: IPoint = {
                x: myLoc.x + newVelocity.x * deltaTime,
                y: myLoc.y - newVelocity.y * deltaTime
            }

            this._oldLocation = this._location
            this._location = newLocation
        }
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }
}
