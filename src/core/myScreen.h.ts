import { IpcNetConnectOpts } from 'net';
import { IColor, IPoint, ISize } from '../gui';

export interface IMyScreen {
    drawRect(point: IPoint, size: ISize, borderColor?: IColor, fillColor?: IColor): void
    drawArc(point: IPoint, radius: number, startAngle: number, endAngle: number, borderColor: IColor, fillColor?: IColor): void
    // clearPoint(point: IPoint): void
    // drawCharacter(point: IPoint, color: IColor, character: string): void
    // drawStraightLine(start: IPoint, end: IPoint, color: IColor, character: string): void
    getSize(): ISize
}
