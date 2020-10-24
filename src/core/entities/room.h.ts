import { IDoor, IEnemy, IPlayer, IRoomTransition, RoomState } from '.'
import { Direction, IUpdatable } from '../'
import { IDrawable, IPoint, ISize } from '../../gui'
import { IHasCollisions } from '../collision'
import { Entity } from './entity'

export interface IRoom extends IDrawable, IUpdatable, IHasCollisions {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getSize(): ISize
    pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    setRoomExit(direction: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    getDoors(): IDoor[]
    doorOpened(door: IDoor): void
    getRoomTransitions(): IRoomTransition[]
    getEnemies(): IEnemy[]
    enemyDied(entity: Entity): void
    getRoomState(): RoomState
    setRoomState(newRoomState: RoomState): void
    getPlayer(): IPlayer
}
