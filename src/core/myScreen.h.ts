import { IColor, IPoint, ISize } from '../gui'

export interface IMyScreen {
    clearScreen(): void
    getSize(): ISize
    drawRect(point: IPoint, size: ISize, borderColor: IColor, fillColor?: IColor): void
    drawArc(point: IPoint, radius: number, startAngle: number, endAngle: number, borderColor: IColor, fillColor?: IColor): void
    drawStraightLine(start: IPoint, end: IPoint, color: IColor): void
    drawEquilateralTriange(center: IPoint, sideLength: number, borderColor: IColor, fillColor?: IColor): void
}
