import { IMyScreen } from '.'
import { Config } from '../config'
import { IColor, IPoint, ISize } from '../gui'

export class MyScreen implements IMyScreen {
    private readonly _canvas: HTMLCanvasElement
    private readonly _context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        const context = canvas.getContext("2d")
        if (context) {
            this._context = context
            this._context.lineWidth = 2
        }
        else {
            console.log('unable to get canvas context')
            throw new Error('unable to get canvas context')
        }
    }

    // ----------------------------------------
    //              IMyScreen
    // ----------------------------------------

    public clearScreen(): void {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this.drawRect({ x: 0, y: 0 }, { width: this._canvas.width, height: this._canvas.height }, Config.MyScreen.BackgroundColor, Config.MyScreen.BackgroundColor)
    }

    public getSize(): ISize {
        return {
            width: this._canvas.width,
            height: this._canvas.height
        }
    }

    public drawRect(point: IPoint, size: ISize, borderColor: IColor, fillColor?: IColor): void {
        this._context.save()
        this._context.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
        if (fillColor) {
            this._context.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
            this._context.fillRect(point.x, point.y, size.width, size.height)
        }
        this._context.strokeRect(point.x, point.y, size.width, size.height)
        this._context.restore()
    }

    public drawArc(point: IPoint, radius: number, startAngleDegrees: number, endAngleDegrees: number, borderColor: IColor, fillColor?: IColor): void {
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

    public drawStraightLine(start: IPoint, end: IPoint, color: IColor): void {
        this._context.save()
        this._context.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.lineWidth = 2
        this._context.beginPath()
        this._context.moveTo(start.x, start.y)
        this._context.lineTo(end.x, end.y)
        this._context.closePath()
        this._context.stroke()
        this._context.restore()
    }

    public drawEquilateralTriange(center: IPoint, sideLength: number, borderColor: IColor, fillColor?: IColor): void {
        const bottomLeftPoint: IPoint = {
            x: center.x - sideLength / Math.sqrt(2),
            y: center.y + sideLength / Math.sqrt(3)
        }
        const topPoint: IPoint = {
            x: center.x,
            y: center.y - sideLength / (2 * Math.sqrt(3))
        }
        const bottomRightPoint: IPoint = {
            x: center.x + sideLength / Math.sqrt(2),
            y: center.y + sideLength / Math.sqrt(3)
        }
        this._context.save()
        this._context.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
        this._context.lineWidth = 2
        this._context.beginPath()
        this._context.moveTo(bottomLeftPoint.x, bottomLeftPoint.y)
        this._context.lineTo(topPoint.x, topPoint.y)
        this._context.lineTo(bottomRightPoint.x, bottomRightPoint.y)
        this._context.closePath()
        this._context.stroke()
        if (fillColor) {
            this._context.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
            this._context.fill()
        }
        this._context.restore()
    }
}
