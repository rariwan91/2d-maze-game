import { Direction, IMyScreen, IUpdatable } from '.'
import { IColor, IDrawable, IPoint } from '../gui'

export class Enemy implements IDrawable, IUpdatable {
    private _location: IPoint
    private _color: IColor = { r: 255, g: 0, b: 0 }
    private _radius: number = 25
    private _direction = Direction.Down
    private readonly _myScreen: IMyScreen

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
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

    public draw(): void {
        this._myScreen.drawArc(this._location, this._radius, 0, 360, this._color)
        // draw enemry direction arc
        switch (this._direction) {
            case Direction.Up:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    45,
                    135,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Right:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    -45,
                    45,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Down:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    225,
                    315,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.Left:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    135,
                    225,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpRight:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    0,
                    90,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownRight:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    -90,
                    0,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.DownLeft:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    180,
                    270,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
            case Direction.UpLeft:
                this._myScreen.drawArc(
                    this._location,
                    this._radius,
                    90,
                    180,
                    { r: 0, g: 255, b: 0 },
                    { r: 0, g: 255, b: 0 }
                )
                break
        }
    }

    public update(deltaTime: number): void {
        deltaTime * 2
        this.draw()
    }
}
