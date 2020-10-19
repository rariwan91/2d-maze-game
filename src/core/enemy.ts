import { Direction, IHasAI, IMyScreen, IUpdatable, Player } from '.'
import { Colors, IColor, IDrawable, IPoint } from '../gui'
import { CircleCollision, ICollidable, IHasCollisions, WallCollision } from './collision'

export class Enemy implements IDrawable, IUpdatable, IHasCollisions, IHasAI {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number = 25
    private _direction = Direction.Down
    private readonly _myScreen: IMyScreen
    private _isColliding = false
    private _collisionCircle: CircleCollision
    private _mainColor: IColor = Colors.Red
    private _secondaryColor: IColor = Colors.Green
    private _yesCollisionColor: IColor = Colors.Red
    private _noCollisionColor: IColor = Colors.Green
    private readonly _movementSpeed = 50
    private _isMoving = false

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(location, this._radius + 3)
    }

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(location: IPoint) {
        this._location = location
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
        // clear enemy circle
        this._myScreen.drawArc(this._oldLocation, this._radius + 2, 0, 360, Colors.White, Colors.White)
    }

    public draw(): void {
        // draw enemy circle
        this._myScreen.drawArc(this._location, this._radius, 0, 360, this._mainColor, this._mainColor)
        // draw enemy direction arc
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

    public update(deltaTime: number): void {
        this.calculateLocation(deltaTime)
        this._collisionCircle.setLocation(this._location)
        this.draw()
    }

    public aiTick(player: Player): void {
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

        if (Math.pow(deltaY, 2) + Math.pow(deltaX, 2) < Math.pow(this._radius + player.getRadius(), 2)) {
            this._isMoving = false
        }
        else {
            this._isMoving = true
        }
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
