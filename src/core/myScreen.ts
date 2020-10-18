import { IMyScreen } from '.'
import { IColor, IPoint, ISize } from '../gui'
import { isPointValid } from '../helpers/pointHelpers'

export class MyScreen implements IMyScreen {
    private readonly _canvas: HTMLCanvasElement
    private readonly _context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        let context = canvas.getContext("2d")
        if (context) {
            this._context = context
            this._context.lineWidth = 2
        }
        else {
            console.log('unable tto get canvas context')
            throw new Error('unable to get canvas context')
        }
    }

    public clearScreen(): void {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }

    public drawRect(point: IPoint, size: ISize, borderColor: IColor, fillColor?: IColor): void {
        if (!isPointValid(point, this.getSize())) return

        this._context.save()
        this._context.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
        if (fillColor) {
            this._context.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
            this._context.fillRect(point.x, point.y, size.width, size.height)
        }
        else {
            this._context.strokeRect(point.x, point.y, size.width, size.height)
        }
        this._context.restore()
    }

    public drawArc(point: IPoint, radius: number, startAngleDegrees: number, endAngleDegrees: number, borderColor: IColor, fillColor?: IColor): void {
        if (!isPointValid(point, this.getSize())) return

        this._context.save()
        this._context.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
        if (fillColor) {
            this._context.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
        }
        this._context.beginPath()
        if (fillColor) {
            this._context.moveTo(point.x, point.y)
            this._context.arc(point.x, point.y, radius, - endAngleDegrees * Math.PI / 180, - startAngleDegrees * Math.PI / 180)
            this._context.fill()
        }
        else {
            this._context.arc(point.x, point.y, radius, - endAngleDegrees * Math.PI / 180, - startAngleDegrees * Math.PI / 180)
            this._context.stroke()
        }
        this._context.closePath()
        this._context.restore()
    }

    public getSize(): ISize {
        return {
            width: this._canvas.width,
            height: this._canvas.height
        }
    }
}
