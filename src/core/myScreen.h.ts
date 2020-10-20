import { IpcNetConnectOpts } from 'net';
import { IColor } from '../gui/color.h'
import { IPoint } from '../gui/point.h'
import { ISize } from '../gui/size.h'

export interface IMyScreen {
    drawRect(point: IPoint, size: ISize, borderColor?: IColor, fillColor?: IColor): void
    drawArc(point: IPoint, radius: number, startAngle: number, endAngle: number, borderColor: IColor, fillColor?: IColor): void
    drawStraightLine(start: IPoint, end: IPoint, color: IColor): void
    getSize(): ISize
}
