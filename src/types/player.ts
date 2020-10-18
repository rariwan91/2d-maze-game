import { Direction, IColor, IControllable, IDrawable, IPoint, IScreen, ISize, IUpdatable } from './'

export class Player implements IDrawable, IControllable, IUpdatable {
    private _location: IPoint
    private _size: ISize = { width: 50, height: 50 }
    private _color: IColor = { r: 255, g: 255, b: 255 }
    private _direction: Direction = Direction.Up
    private readonly _screen: IScreen

    // private readonly _accel = 0.25
    // private readonly _maxSpeed = 2
    // private _oldDirection = Direction.Up
    // private _currentVelocity = {
    //     x: 0,
    //     y: 0
    // }
    // private _oldVelocity = this._currentVelocity

    constructor(roomSize: ISize, screen: IScreen) {
        this._location = {
            x: roomSize.width / 2,
            y: roomSize.height / 2
        }
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
        this._screen.drawArc(
            this.location,
            Math.sqrt(2 * Math.pow(25, 2)) + 1,
            0,
            360,
            {r: 255, g: 255, b: 255}
        )
        this._screen.drawRect({
            x: this.location.x - 25,
            y: this.location.y - 25
        }, this.size,
            {r: 0, g: 0, b: 255},
            {r: 0, g: 0, b: 255}
        )
        switch(this._direction) {
            case Direction.Up:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    45,
                    135,
                    {r: 0, g: 0, b: 255}
                )
            break
            case Direction.Right:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    -45,
                    45,
                    {r: 0, g: 0, b: 255}
                )
            break
            case Direction.Down:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    225,
                    315,
                    {r: 0, g: 0, b: 255}
                )
            break
            case Direction.Left:
                this._screen.drawArc(
                    this.location,
                    Math.sqrt(2 * Math.pow(25, 2)),
                    135,
                    225,
                    {r: 0, g: 0, b: 255}
                )
            break
        }
    }

    public direction(direction: Direction) {
        // this._oldDirection = this._direction
        this._direction = direction
        // switch(direction) {
        //     case Direction.Up:
        //         this._currentVelocity.x = 0
        //     break;
        //     case Direction.Right:
        //         this._currentVelocity.y = 0
        //     break;
        //     case Direction.Down:
        //         this._currentVelocity.x = 0
        //     break;
        //     case Direction.Left:
        //         this._currentVelocity.y = 0
        //     break;
        // }
    }

    public update(deltaTime: number): void {
        // this.calculateLocation(deltaTime)
        deltaTime * 2
        this.draw()
    }

    // private calculateLocation(deltaTime: number): void {
    //     // if directions are the same then we continue moving
    //     // in the same direction
    //     switch(this._direction) {
    //         case Direction.Up:
    //             const dUp = this._oldVelocity.y * deltaTime
    //                 - 0.5 * this._accel * deltaTime * deltaTime
    //             this._currentVelocity.y = this._oldVelocity.y - this._accel * deltaTime
    //             this._location.y = this._location.y + dUp
    //         break;
    //         case Direction.Right:
    //             const dRight = this._oldVelocity.x * deltaTime
    //                 + 0.5 * this._accel * deltaTime * deltaTime
    //             this._currentVelocity.x = this._oldVelocity.x + this._accel * deltaTime
    //             this._location.x = this._location.x + dRight
    //         break;
    //         case Direction.Down:
    //             const dDown = this._oldVelocity.y * deltaTime
    //                 + 0.5 * this._accel * deltaTime * deltaTime
    //             this._currentVelocity.y = this._oldVelocity.y + this._accel * deltaTime
    //             this._location.y = this._location.y + dDown
    //         break;
    //         case Direction.Left:
    //             const dLeft = this._oldVelocity.x * deltaTime
    //                 - 0.5 * this._accel * deltaTime * deltaTime
    //             this._currentVelocity.x = this._oldVelocity.x - this._accel * deltaTime
    //             this._location.x = this._location.x + dLeft
    //         break;

    //     }

    //     this._oldVelocity = this._currentVelocity
    // }
}
