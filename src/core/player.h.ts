import { Direction, IControllable, IUpdatable, IWeapon } from '.'
import { IPoint } from '../gui'
import { IHasCollisions } from './collision'

export interface IPlayer extends IHasCollisions, IUpdatable, IControllable {
    getLocation(): IPoint
    getRadius(): number
    getMostRecentDirection(): Direction
    equipWeapon(weapon: IWeapon): void
    unequipWeapon(weapon: IWeapon): void
}