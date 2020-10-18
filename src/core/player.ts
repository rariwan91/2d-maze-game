import { Direction, IControllable, IMyScreen, IUpdatable } from '.'
import { IColor, IDrawable, IPoint } from '../gui'

export class Player implements IDrawable, IControllable, IUpdatable {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius: number = 25
    private _color: IColor = { r: 255, g: 255, b: 255 }
    private _direction: Direction = Direction.Up
    private _isMoving: boolean = false
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 200

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
    }

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(location: IPoint) {
        this._location = location
    }

    public getColor(): IColor {
        return this._color
    }

    public setColor(color: IColor) {
        this._color = color
    }

    public getRadius(): number {
        return this._radius
    }

    public setRadius(radius: number) {
        this._radius = radius
    }

    public draw(): void {
        // clear character area
        this._myScreen.drawArc(
            this._oldLocation,
            this._radius + 1,
            0,
            360,
            { r: 255, g: 255, b: 255 }
        )
        // draw character circle
        this._myScreen.drawArc(
            this._location,
            this._radius,
            0,
            360,
            { r: 0, g: 0, b: 255 }
        )
        // draw character direction arc
        switch (this._direction) {
            case Direction.Up:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    45,
                    135,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Right:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    -45,
                    45,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Down:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    225,
                    315,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Left:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    135,
                    225,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpRight:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    0,
                    90,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownRight:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    -90,
                    0,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownLeft:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    180,
                    270,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpLeft:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    90,
                    180,
                    { r: 0, g: 255, b: 0 }
                )
                break
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
}
