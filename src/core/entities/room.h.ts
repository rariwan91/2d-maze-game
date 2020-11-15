import { Direction, IUpdatable } from '../'
import { IDoor, IEnemy, IPlayer, IRoomTransition, RoomState } from '.'
import { IDrawable, IPoint, ISize } from '../../gui'

import { Entity } from './entity'
import { IWall } from './wall.h'

export interface IRoom extends IDrawable, IUpdatable {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getSize(): ISize
    pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom, isOpen?: boolean): void
    setRoomExit(direction: Direction.Up | Direction.Down | Direction.Right | Direction.Left, room: IRoom): void
    getDoors(): IDoor[]
    doorOpened(door: IDoor): void
    getRoomTransitions(): IRoomTransition[]
    addEnemyToRoom(enemy: IEnemy): void
    getEnemies(): IEnemy[]
    enemyDied(entity: Entity): void
    getRoomState(): RoomState
    setRoomState(newRoomState: RoomState): void
    getPlayer(): IPlayer
    getWalls(): IWall[]
    addWallToRoom(wall: IWall): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRoomGraph(): any
    isValidPoint(point: IPoint): boolean
}
