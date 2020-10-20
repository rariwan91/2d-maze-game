import { IPoint, ISize } from '../gui'

export interface IRoom {
    getLocation(): IPoint
    getSize(): ISize
}