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

    public drawRect(point: IPoint, size: ISize, color: IColor): void {
        if(!isPointValid(point, this.getSize())) return

        this._context.save()
        this._context.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.strokeRect(point.x, point.y, size.width, size.height)
        this._context.restore()
    }

    public drawArc(point: IPoint, radius: number, startAngleDegrees: number, endAngleDegrees: number, color: IColor): void {
        if(!isPointValid(point, this.getSize())) return        

        this._context.save()
        this._context.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.beginPath()
        this._context.moveTo(point.x, point.y)
        this._context.arc(point.x, point.y, radius, - endAngleDegrees * Math.PI / 180, - startAngleDegrees * Math.PI / 180)
        this._context.fill()
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
