import { Direction, IHasHealth, IRespondsToInput, IUpdatable, IWeapon } from '.'
import { IDrawable, IPoint } from '../gui'
import { IHasCollisions } from './collision'

export interface IPlayer extends IHasCollisions, IUpdatable, IRespondsToInput, IDrawable, IHasHealth {
    getLocation(): IPoint
    getOldLocation(): IPoint
    getRadius(): number
    getMostRecentDirection(): Direction
    equipWeapon(weapon: IWeapon): void
    unequipWeapon(weapon: IWeapon): void
}
