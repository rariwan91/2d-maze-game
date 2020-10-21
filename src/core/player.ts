import { Direction, Enemy, IMyScreen, IPlayer, IWeapon, PlayerState, Room } from '.'
import { Colors, IPoint, Keycode } from '../gui'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar, getDirection } from '../helpers'
import { CircleCollision, CollisionConfig, ICollidable } from './collision'
import { Entity } from './entity'

export class Player extends Entity implements IPlayer {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius: number = 25
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 200
    private _collisionCircle: CircleCollision
    private readonly _mainColor = Colors.Blue
    private readonly _secondaryColor = Colors.Green
    private readonly _noCollisionColor = Colors.Green
    private readonly _yesCollisionColor = Colors.Red
    private readonly _invincibleColor = Colors.Blue
    private _maxHealth: number = 100
    private _currentHealth: number = 100
    private _weapon: IWeapon
    private _upPressed = false
    private _rightPressed = false
    private _downPressed = false
    private _leftPressed = false
    private _direction = Direction.Up
    private _state = PlayerState.Normal
    private _entitiesCollidingWithMe: Entity[] = []
    private _lastTookDamage: number

    constructor(location: IPoint, myScreen: IMyScreen) {
        super()
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(this._location, this._radius + 3, this)
    }

    public getLocation(): IPoint {
        return this._location
    }

    public getOldLocation(): IPoint {
        return this._oldLocation
    }

    public getRadius(): number {
        return this._radius
    }

    public getMostRecentDirection(): Direction {
        return this._direction
    }

    public getDirection(): Direction {
        return getDirection(this._upPressed, this._rightPressed, this._downPressed, this._leftPressed)
    }

    public isMoving(): boolean {
        return this.getDirection() !== Direction.None
    }

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, this._mainColor, this._secondaryColor)

        if(CollisionConfig && CollisionConfig.Players.ShowCollisionBoxes) {
            if(this._state === PlayerState.InvincibleDueToDamage) {
                drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), this._invincibleColor, this._invincibleColor, this.isColliding())
            }
            else {
                drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), this._yesCollisionColor, this._noCollisionColor, this.isColliding())
            }
        }

        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    public keyPressed(keyCode: Keycode) {
        if (keyCode === Keycode.Up) {
            this._upPressed = true
        }
        else if (keyCode === Keycode.Right) {
            this._rightPressed = true
        }
        else if (keyCode === Keycode.Down) {
            this._downPressed = true
        }
        else if (keyCode === Keycode.Left) {
            this._leftPressed = true
        }
        else if (keyCode === Keycode.SPACE) {
            if (this._weapon) {
                this._weapon.attack()
            }
        }
    }

    public keyReleased(keyCode: Keycode) {
        if (keyCode === Keycode.Up) {
            this._upPressed = false
        }
        else if (keyCode === Keycode.Right) {
            this._rightPressed = false
        }
        else if (keyCode === Keycode.Down) {
            this._downPressed = false
        }
        else if (keyCode === Keycode.Left) {
            this._leftPressed = false
        }
        if (keyCode === Keycode.SPACE) {

        }
    }

    public update(deltaTime: number): void {
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Room) {
                this._location = this._oldLocation
            }
            else if (entity instanceof Enemy) {
                if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                    this._state = PlayerState.InvincibleDueToDamage
                }
            }
        })

        if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
            this._state = PlayerState.Normal
        }

        this.updateDirection()
        this.calculateLocation(deltaTime)
        this._collisionCircle.setLocation(this._location)
        this.draw()
        if (this._weapon) {
            this._weapon.update(deltaTime)
        }
    }

    private updateDirection(): void {
        const newDirection = this.getDirection()
        if (newDirection !== Direction.None) {
            this._direction = newDirection
        }
    }

    private calculateLocation(deltaTime: number): void {
        if(this.getDirection() === Direction.None) return

        const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
        const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)
        this._oldLocation = this._location
        this._location = newLocation
    }

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionCircle]
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    public checkForCollisionsWith(shapes: ICollidable[]): void {
        const collidingShapes = this._collisionCircle.isCollidingWithShapes(shapes)
        const collidingEntities: Entity[] = []
        collidingShapes.forEach(collidable => {
            const entity = collidable.getEntity()
            if(!collidingEntities.includes(entity)) {
                collidingEntities.push(entity)
            }
        })
        this._entitiesCollidingWithMe = collidingEntities
    }

    public getMaxHealth(): number {
        return this._maxHealth
    }

    public getCurrentHealth(): number {
        return this._currentHealth
    }

    public takeDamage(amount: number): void {
        this._currentHealth = Math.max(this._currentHealth - amount, 0)
    }

    public equipWeapon(weapon: IWeapon) {
        this._weapon = weapon
    }

    public unequipWeapon(weapon: IWeapon) {
        weapon
        this._weapon = null
    }
}
