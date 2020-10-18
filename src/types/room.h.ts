import { IPoint, ISize } from './';

export interface IRoom {
    getLocation(): IPoint
    getSize(): ISize
}