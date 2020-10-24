import { Direction, IHasAI, IHasHealth, IUpdatable } from '../'
import { IDrawable, IPoint } from '../../gui'
import { IHasCollisions } from '../collision'
import { IRoom } from './room.h'

export interface IEnemy extends IDrawable, IUpdatable, IHasCollisions, IHasAI, IHasHealth {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getOldLocation(): IPoint
    setOldLocation(newOldLocation: IPoint): void
    getDirection(): Direction
    setRoom(newRoom: IRoom): void
}
