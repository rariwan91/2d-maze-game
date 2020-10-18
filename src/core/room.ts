import { IMyScreen, IRoom, IUpdatable } from '.'
import { IColor, IDrawable, IPoint, ISize } from '../gui'

export class Room implements IDrawable, IRoom, IUpdatable {
    private _location: IPoint
    private _color: IColor = { r: 255, g: 0, b: 0 }
    private readonly _width: number
    private readonly _height: number
    private readonly _myScreen: IMyScreen

    constructor(myScreen: IMyScreen) {
        this._myScreen = myScreen
        this._width = myScreen.getSize().width - 40
        this._height = myScreen.getSize().height - 40
        this._location = { x: 20, y: 20 }
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

    public getSize(): ISize {
        return {
            width: this._width,
            height: this._height
        }
    }

    public draw(): void {
        this._myScreen.drawRect(this.getLocation(), this.getSize(), this.getColor())
    }

    public update(): void {
        this.draw()
    }
}
