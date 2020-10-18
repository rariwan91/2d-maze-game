import { IColor, IDrawable, IPoint, IScreen, ISize, IUpdatable } from './'

export class Enemy implements IDrawable {
    private _location: IPoint
    private _color: IColor = { r: 255, g: 0, b: 0 }
    private readonly _screen: IScreen

    constructor(roomSize: ISize, screen: IScreen) {
        this._location = {
            x: 1 + (Math.random() * roomSize.width),
            y: 1 + (Math.random() * roomSize.height)
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

    public draw(): void {
        // this._screen.drawPoint(this.location, this.color)
    }

    // public update(deltaTime: number): void {
    //     // calulate location
    //     this.draw()
    // }
}