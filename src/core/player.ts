import { Direction, IControllable, IHasHealth, IMyScreen, IUpdatable } from '.'
import { Colors, IColor, IDrawable, IPoint } from '../gui'
import { clearOldCharacter, clearOldCollision, clearOldHealthBar, drawCharacter, drawCollision, drawHealthBar } from '../helpers'
import { CircleCollision, EnemyCollision, ICollidable, IHasCollisions, WallCollision } from './collision'

export class Player implements IDrawable, IControllable, IUpdatable, IHasCollisions, IHasHealth {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius: number = 25
    private _direction: Direction = Direction.Up
    private _isMoving: boolean = false
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

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(this._location, this._radius + 3)
    }

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(location: IPoint) {
        this._location = location
    }

    public getRadius(): number {
        return this._radius
    }

    public setRadius(radius: number) {
        this._radius = radius
    }

    public clearOld(): void {
        clearOldCollision(this._myScreen, this._collisionCircle.getOldLocation(), this._collisionCircle.getRadius())
        clearOldCharacter(this._myScreen, this._oldLocation, this._radius)
        clearOldHealthBar(this._myScreen, this._oldLocation, this._radius)
    }

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, this._mainColor, this._secondaryColor)
        drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), this._yesCollisionColor, this._noCollisionColor, this._isColliding)
        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    public directionPressed(direction: Direction): void {
        if (!this._isMoving) {
            this._direction = direction
            this._isMoving = true
            return
        }
        switch (direction) {
            case Direction.Up:
                if (this._direction === Direction.Right) {
                    this._direction = Direction.UpRight
                }
                else if (this._direction === Direction.Left) {
                    this._direction = Direction.UpLeft
                }
                else {
                    this._direction = Direction.Up
                }
                this._isMoving = true
                break;
            case Direction.Right:
                if (this._direction === Direction.Up) {
                    this._direction = Direction.UpRight
                }
                else if (this._direction === Direction.Down) {
                    this._direction = Direction.DownRight
                }
                else {
                    this._direction = Direction.Right
                }
                this._isMoving = true
                break;
            case Direction.Down:
                if (this._direction === Direction.Right) {
                    this._direction = Direction.DownRight
                }
                else if (this._direction === Direction.Left) {
                    this._direction = Direction.DownLeft
                }
                else {
                    this._direction = Direction.Down
                }
                this._isMoving = true
                break;
            case Direction.Left:
                if (this._direction === Direction.Up) {
                    this._direction = Direction.UpLeft
                }
                else if (this._direction === Direction.DownLeft) {
                    this._direction = Direction.DownLeft
                }
                else {
                    this._direction = Direction.Left
                }
                this._isMoving = true
                break
        }
    }

    public directionReleased(direction: Direction): void {
        switch (direction) {
            case Direction.Up:
                if (this._direction === Direction.UpRight) {
                    this._direction = Direction.Right
                    this._isMoving = true
                }
                else if (this._direction === Direction.UpLeft) {
                    this._direction = Direction.Left
                    this._isMoving = true
                }
                else if (this._direction === Direction.Up) {
                    this._isMoving = false
                }
                break;
            case Direction.Right:
                if (this._direction === Direction.UpRight) {
                    this._direction = Direction.Up
                    this._isMoving = true
                }
                else if (this._direction === Direction.DownRight) {
                    this._direction = Direction.DownRight
                    this._isMoving = true
                }
                else if (this._direction === Direction.Right) {
                    this._isMoving = false
                }
                break;
            case Direction.Down:
                if (this._direction === Direction.DownRight) {
                    this._direction = Direction.Right
                    this._isMoving = true
                }
                else if (this._direction === Direction.DownLeft) {
                    this._direction = Direction.Left
                    this._isMoving = true
                }
                else if (this._direction === Direction.Down) {
                    this._isMoving = false
                }
                break;
            case Direction.Left:
                if (this._direction === Direction.UpLeft) {
                    this._direction = Direction.Up
                    this._isMoving = true
                }
                else if (this._direction === Direction.DownLeft) {
                    this._direction = Direction.Down
                    this._isMoving = true
                }
                else if (this._direction === Direction.Left) {
                    this._isMoving = false
                }
                break;
        }
    }

    public update(deltaTime: number): void {
        this.calculateLocation(deltaTime)
        this._collisionCircle.setLocation(this._location)
        this.draw()
    }

    private calculateLocation(deltaTime: number): void {
        if (!this._isMoving) return

        let newVelocity = {
            x: 0,
            y: 0
        }
        switch (this._direction) {
            case Direction.Up:
                newVelocity = {
                    x: 0,
                    y: -this._movementSpeed
                }
                break;
            case Direction.Right:
                newVelocity = {
                    x: this._movementSpeed,
                    y: 0
                }
                break;
            case Direction.Down:
                newVelocity = {
                    x: 0,
                    y: this._movementSpeed
                }
                break;
            case Direction.Left:
                newVelocity = {
                    x: -this._movementSpeed,
                    y: 0
                }
                break;
            case Direction.UpRight:
                newVelocity = {
                    x: this._movementSpeed * Math.sin(45 * Math.PI / 180),
                    y: -this._movementSpeed * Math.sin(45 * Math.PI / 180)
                }
                break
            case Direction.DownRight:
                newVelocity = {
                    x: this._movementSpeed * Math.sin(45 * Math.PI / 180),
                    y: this._movementSpeed * Math.sin(45 * Math.PI / 180)
                }
                break
            case Direction.DownLeft:
                newVelocity = {
                    x: -this._movementSpeed * Math.sin(45 * Math.PI / 180),
                    y: this._movementSpeed * Math.sin(45 * Math.PI / 180)
                }
                break
            case Direction.UpLeft:
                newVelocity = {
                    x: -this._movementSpeed * Math.sin(45 * Math.PI / 180),
                    y: -this._movementSpeed * Math.sin(45 * Math.PI / 180)
                }
                break
        }

        const newLocation = {
            x: this._location.x + newVelocity.x * deltaTime,
            y: this._location.y + newVelocity.y * deltaTime
        }

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
}
