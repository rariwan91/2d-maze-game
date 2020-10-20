import { IPoint } from '../gui/point.h'
import { ISize } from '../gui/size.h'

export interface IRoom {
    getLocation(): IPoint
    getSize(): ISize
}