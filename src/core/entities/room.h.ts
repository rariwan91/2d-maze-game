import { IDoor, IRoomTransition } from '.'
import { Direction, IUpdatable } from '../'
import { IDrawable, IPoint, ISize } from '../../gui'
import { IHasCollisions } from './../collision'

export interface IRoom extends IDrawable, IUpdatable, IHasCollisions {
    getLocation(): IPoint
    getSize(): ISize
    pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    setRoomExit(direction: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    getDoors(): IDoor[]
    doorOpened(door: IDoor): void
    getRoomTransitions(): IRoomTransition[]
}
