import { Direction, IHasAI, IHasHealth, IMyScreen, IPlayer, IUpdatable } from '.'
import { Colors, IColor, IDrawable, IPoint } from '../gui'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar } from '../helpers'
import { EnemyCollision, ICollidable, IHasCollisions, PlayerWeaponCollision, WallCollision } from './collision'
import { Entity } from './entity'
import { Sword } from './sword'
import { IWeapon } from './weapon.h'

export class Enemy extends Entity implements IDrawable, IUpdatable, IHasCollisions, IHasAI, IHasHealth {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number = 25
    private _direction = Direction.Down
    private readonly _myScreen: IMyScreen
    private _isColliding = false
    private _collisionShape: EnemyCollision
    private _mainColor: IColor = Colors.Red
    private _secondaryColor: IColor = Colors.Green
    private _yesCollisionColor: IColor = Colors.Red
    private _noCollisionColor: IColor = Colors.Green
    private readonly _movementSpeed = 50
    private _isMoving = false
    private _maxHealth: number = 100
    private _currentHealth: number = 100

    constructor(location: IPoint, myScreen: IMyScreen) {
        super()
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionShape = new EnemyCollision(location, this._radius + 3, this)
    }

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(location: IPoint) {
        this._location = location
    }

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, this._mainColor, this._secondaryColor)
        drawCollision(this._myScreen, this._collisionShape.getLocation(), this._collisionShape.getRadius(), this._yesCollisionColor, this._noCollisionColor, this._isColliding)
        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    public update(deltaTime: number): void {
        this.calculateLocation(deltaTime)
        this._collisionShape.setLocation(this._location)
        this.draw()
    }

    public aiTick(player: IPlayer): void {
        const myLoc = this._location
        const pLoc = player.getLocation()
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

        // if (Math.pow(deltaY, 2) + Math.pow(deltaX, 2) < Math.pow(this._radius + player.getRadius(), 2)) {
        //     this._isMoving = false
        // }
        // else {
        //     this._isMoving = true
        // }
    }

    private calculateLocation(deltaTime: number): void {
        if (!this._isMoving) return

        const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
        const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)

        this._oldLocation = this._location
        this._location = newLocation
    }

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionShape]
    }

    private _lastTookDamage: number
    public collisionStarted(shapes: ICollidable[]): void {
        this._isColliding = true

        shapes.forEach(shape => {
            if (shape instanceof WallCollision) {
                this._location = this._oldLocation
            }
            else if(shape instanceof PlayerWeaponCollision) {
                const weapon = shape.getEntity() as Sword

                if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                }
            }
        })
    }

    public collisionEnded(): void {
        this._isColliding = false
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
}
