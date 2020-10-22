import { IPoint, ISize } from '../gui'
import { Direction } from './direction.enum';

export interface IRoom {
    getLocation(): IPoint
    getSize(): ISize
    pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    setRoomExit(direction: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
}