import { Direction, IControllable, IMyScreen, IUpdatable } from '.'
import { Colors, IColor, IDrawable, IPoint } from '../gui'
import { CircleCollision, ICollidable, IHasCollisions } from './collision'
import { WallCollision } from './collision/wallCollision'

export class Player implements IDrawable, IControllable, IUpdatable, IHasCollisions {
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
        // clear collision rectangle while I figure out circle vs rectangle collision
        this._myScreen.drawRect({
            x: this._collisionCircle.getOldLocation().x - this._collisionCircle.getRadius() - 2,
            y: this._collisionCircle.getOldLocation().y - this._collisionCircle.getRadius() - 2
        }, {
            width: 2 * this._collisionCircle.getRadius() + 4,
            height: 2 * this._collisionCircle.getRadius() + 4
        }, Colors.White, Colors.White)
        // clear character circle
        this._myScreen.drawArc(this._oldLocation, this._radius + 2, 0, 360, Colors.White, Colors.White)
    }

    public draw(): void {
        // draw character circle
        this._myScreen.drawArc(this._location, this._radius, 0, 360, this._mainColor, this._mainColor)
        // draw character direction arc
        switch (this._direction) {
            case Direction.Up:
                this._myScreen.drawArc(this._location, this._radius, 45, 135, this._secondaryColor, this._secondaryColor)
                break
            case Direction.Right:
                this._myScreen.drawArc(this._location, this._radius, -45, 45, this._secondaryColor, this._secondaryColor)
                break
            case Direction.Down:
                this._myScreen.drawArc(this._location, this._radius, 225, 315, this._secondaryColor, this._secondaryColor)
                break
            case Direction.Left:
                this._myScreen.drawArc(this._location, this._radius, 135, 225, this._secondaryColor, this._secondaryColor)
                break
            case Direction.UpRight:
                this._myScreen.drawArc(this._location, this._radius, 0, 90, this._secondaryColor, this._secondaryColor)
                break
            case Direction.DownRight:
                this._myScreen.drawArc(this._location, this._radius, -90, 0, this._secondaryColor, this._secondaryColor)
                break
            case Direction.DownLeft:
                this._myScreen.drawArc(this._location, this._radius, 180, 270, this._secondaryColor, this._secondaryColor)
                break
            case Direction.UpLeft:
                this._myScreen.drawArc(this._location, this._radius, 90, 180, this._secondaryColor, this._secondaryColor)
                break
        }
        // draw collision rectangle while I figure out circle vs rectangle collision
        if (this._isColliding) {
            this._myScreen.drawRect({
                x: this._collisionCircle.getLocation().x - this._collisionCircle.getRadius(),
                y: this._collisionCircle.getLocation().y - this._collisionCircle.getRadius()
            }, {
                width: 2 * this._collisionCircle.getRadius(),
                height: 2 * this._collisionCircle.getRadius()
            }, this._yesCollisionColor)
        }
        else {
            this._myScreen.drawRect({
                x: this._collisionCircle.getLocation().x - this._collisionCircle.getRadius(),
                y: this._collisionCircle.getLocation().y - this._collisionCircle.getRadius()
            }, {
                width: 2 * this._collisionCircle.getRadius(),
                height: 2 * this._collisionCircle.getRadius()
            }, this._noCollisionColor)
        }
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

    public collisionStarted(shapes: ICollidable[]): void {
        this._isColliding = true

        shapes.forEach(shape => {
            if (shape instanceof WallCollision) {
                this._location = this._oldLocation
            }
        })
    }

    public collisionEnded(): void {
        this._isColliding = false
    }
}
