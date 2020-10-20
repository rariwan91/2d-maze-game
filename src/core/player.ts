import { Direction, IHasHealth, IMyScreen, IWeapon, IPlayer } from '.'
import { Colors, IColor, IDrawable, IPoint, Keycode } from '../gui'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar, getDirection } from '../helpers'
import { CircleCollision, EnemyCollision, ICollidable, WallCollision } from './collision'

export class Player implements IDrawable, IHasHealth, IPlayer {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius: number = 25
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 200
    private _collisionCircle: CircleCollision
    private _isColliding = false
    private _mainColor: IColor = Colors.Blue
    private _secondaryColor: IColor = Colors.Green
    private _noCollisionColor: IColor = Colors.Green
    private _yesCollisionColor: IColor = Colors.Red
    private _maxHealth: number = 100
    private _currentHealth: number = 100
    private _weapon: IWeapon
    private _upPressed = false
    private _rightPressed = false
    private _downPressed = false
    private _leftPressed = false
    private _direction = Direction.Up

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(this._location, this._radius + 3)
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
        drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), this._yesCollisionColor, this._noCollisionColor, this._isColliding)
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
            if(this._weapon) {
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
        if (!this.isMoving()) return

        const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
        const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)

        this._oldLocation = this._location
        this._location = newLocation
    }

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionCircle]
    }

    private _lastTookDamage: number
    public collisionStarted(shapes: ICollidable[]): void {
        this._isColliding = true

        shapes.forEach(shape => {
            if (shape instanceof WallCollision) {
                this._location = this._oldLocation
            }
            else if (shape instanceof EnemyCollision) {
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

    public equipWeapon(weapon: IWeapon) {
        this._weapon = weapon
    }

    public unequipWeapon(weapon: IWeapon) {
        weapon
        this._weapon = null
    }
}
