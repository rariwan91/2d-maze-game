import { IRespondsToInput, IUpdatable } from '.'
import { IDrawable, IPoint, ISize } from '../gui'
import { IHasCollisions } from './collision'
import { Direction } from './direction.enum'

export interface IRoom extends IDrawable, IUpdatable, IHasCollisions, IRespondsToInput {
    getLocation(): IPoint
    getSize(): ISize
    pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    setRoomExit(direction: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
}
