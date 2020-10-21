import { Direction, IControllable, IHasHealth, IUpdatable, IWeapon } from '.'
import { IDrawable, IPoint } from '../gui'
import { IHasCollisions } from './collision'

export interface IPlayer extends IHasCollisions, IUpdatable, IControllable, IDrawable, IHasHealth {
    getLocation(): IPoint
    getRadius(): number
    getMostRecentDirection(): Direction
    equipWeapon(weapon: IWeapon): void
    unequipWeapon(weapon: IWeapon): void
}