import { IColor, IDrawable, IPoint, IScreen, ISize, WallType } from './'

export class Room implements IDrawable {
    private _location: IPoint
    private _color: IColor = { r: 255, g: 0, b: 0 }
    private readonly _width: number
    private readonly _height: number
    private readonly _screen: IScreen

    constructor(screen: IScreen) {
        this._screen = screen
        this._width = screen.getSize().width - 10
        this._height = screen.getSize().height - 4
        this._location = { x: 5, y: 2 }
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
        return {
            width: this._width,
            height: this._height
        }
    }

    public draw(): void {
        // this._screen.drawStraightLine({
        //     x: this.location.x + 1,
        //     y: this.location.y
        // }, {
        //     x: this.location.x + this._width - 1,
        //     y: this.location.y
        // }, this.color, WallType.Top)

        // this._screen.drawCharacter({
        //     x: this.location.x + this._width,
        //     y: this.location.y
        // }, this.color, WallType.TopRight)

        // this._screen.drawStraightLine({
        //     x: this.location.x + this._width,
        //     y: this.location.y + 1
        // }, {
        //     x: this.location.x + this._width,
        //     y: this.location.y + this._height - 1
        // }, this.color, WallType.Right)

        // this._screen.drawCharacter({
        //     x: this.location.x + this._width,
        //     y: this.location.y + this._height
        // }, this.color, WallType.BottomRight)

        // this._screen.drawStraightLine({
        //     x: this.location.x + 1,
        //     y: this.location.y + this._height
        // }, {
        //     x: this.location.x + this._width - 1,
        //     y: this.location.y + this._height
        // }, this.color, WallType.Bottom)

        // this._screen.drawCharacter({
        //     x: this.location.x,
        //     y: this.location.y + this._height
        // }, this.color, WallType.BottomLeft)

        // this._screen.drawStraightLine({
        //     x: this.location.x,
        //     y: this.location.y + 1
        // }, {
        //     x: this.location.x,
        //     y: this.location.y + this._height - 1
        // }, this.color, WallType.Left)

        // this._screen.drawCharacter({
        //     x: this.location.x,
        //     y: this.location.y
        // }, this.color, WallType.TopLeft)
    }
}