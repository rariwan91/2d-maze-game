import { isPointValid } from '../helpers/pointHelpers'
import { IColor, IPoint, ISize, IScreen } from './'

export class MyScreen implements IScreen {
    private readonly _canvas: HTMLCanvasElement
    private readonly _context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        let context = canvas.getContext("2d")
        if(context) {
            this._context = context
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
        this._context.save()
        this._context.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.fillRect(point.x, point.y, size.width, size.height)
        this._context.restore()
    }

    public drawArc(point: IPoint, radius: number, startAngleDegrees: number, endAngleDegrees: number, color: IColor): void {
        this._context.save()
        this._context.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        this._context.beginPath()
        this._context.arc(point.x, point.y, radius, - endAngleDegrees * Math.PI / 180, - startAngleDegrees * Math.PI / 180)
        this._context.fill()
        this._context.closePath()
        this._context.restore()
    }

    // public clearPoint(point: IPoint): void {
    //     this.drawCharacter(point, null, ' ')
    // }

    // public drawCharacter(point: IPoint, color: IColor | null, character: string) {
    //     if (!isPointValid(point, this.getSize())) return

    //     if(color) {
    //         this._cursor.fg.rgb(color.r, color.g, color.b)
    //     }
        
    //     this._cursor.goto(point.x, point.y)
    //     this._cursor.write(`${character}\n`)
    // }

    // public drawStraightLine(start: IPoint, end: IPoint, color: IColor, character: string) {
    //     if(!isPointValid(start, this.getSize()) || !isPointValid(end, this.getSize())) return

    //     if(start.x === end.x && start.y !== end.y) {
    //         for(let y = start.y; y <= end.y; y++) {
    //             this.drawCharacter({x: start.x, y}, color, character)
    //         }
    //     }
    //     else if(start.x !== end.x && start.y === end.y) {
    //         for(let x = start.x; x <= end.x; x++) {
    //             this.drawCharacter({x, y: start.y}, color, character)
    //         }
    //     }
    // }

    // public drawText(point: IPoint, color: IColor, text: string) {
    //     if(!isPointValid(point, this.getSize())) return

    //     this._cursor.fg.rgb(color.r, color.g, color.b)
    //     this._cursor.goto(point.x, point.y).write(text)
    // }

    public getSize(): ISize {
        return {
            width: this._canvas.width,
            height: this._canvas.height
        }
    }
}
