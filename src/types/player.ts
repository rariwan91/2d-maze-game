import { Direction, IColor, IControllable, IDrawable, IPoint, IScreen, ISize, IUpdatable } from './'

export class Player implements IDrawable, IControllable, IUpdatable {
    private _location: IPoint
    private _oldLocation: IPoint
    private _size: ISize = { width: 50, height: 50 }
    private _color: IColor = { r: 255, g: 255, b: 255 }
    private _direction: Direction = Direction.Up
    private _isMoving: boolean = false
    private readonly _screen: IScreen
    private readonly _movementSpeed = 200

    constructor(roomSize: ISize, screen: IScreen) {
        this._location = {
            x: roomSize.width / 2,
            y: roomSize.height / 2
        }
        this._oldLocation = this._location
        this._screen = screen
    }

    public get location(): IPoint {
        return this._location
    }

    public set location(location: IPoint) {
        this._location = location
    }

    public get color(): IColor {
        return this._color
    }

    public set color(color: IColor) {
        this._color = color
    }

    public get size(): ISize {
        return this._size
    }

    public set size(size: ISize) {
        this._size = size
    }

    public draw(): void {
        // clear character area
        this._screen.drawArc(
            this._oldLocation,
            Math.sqrt(2 * Math.pow(25, 2)) + 2,
            0,
            360,
            { r: 255, g: 255, b: 255 }
        )
        // draw character circle
        this._screen.drawArc(
            this.location,
            Math.sqrt(2 * Math.pow(25, 2)),
            0,
            360,
            { r: 0, g: 0, b: 255 }
        )
        // draw character direction arc
        switch (this._direction) {
            case Direction.Up:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    45,
                    135,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Right:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    -45,
                    45,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Down:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    225,
                    315,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Left:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    135,
                    225,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpRight:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    0,
                    90,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownRight:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    -90,
                    0,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownLeft:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    180,
                    270,
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpLeft:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
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
        if (this._isMoving) {
            this.calculateLocation(deltaTime)
        }
        this.draw()
    }

    private calculateLocation(deltaTime: number): void {
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

        let newLocation = {
            x: this.location.x + newVelocity.x * deltaTime,
            y: this.location.y + newVelocity.y * deltaTime
        }

        this._oldLocation = this.location
        this.location = newLocation
    }
}
