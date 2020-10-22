import { IHasAI, IHasHealth, IUpdatable } from '.'
import { IDrawable, IPoint } from '../gui'
import { IHasCollisions } from './collision'
import { Direction } from './direction.enum'

export interface IEnemy extends IDrawable, IUpdatable, IHasCollisions, IHasAI, IHasHealth {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getOldLocation(): IPoint
    setOldLocation(newOldLocation: IPoint): void
    getDirection(): Direction
}
