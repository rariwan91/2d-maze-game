import { Direction, IHasHealth, IRespondsToInput, IUpdatable } from '..'
import { IDrawable, IPoint } from '../../gui'
import { IHasCollisions } from '../collision'
import { IWeapon } from './weapons'

export interface IPlayer extends IHasCollisions, IUpdatable, IRespondsToInput, IDrawable, IHasHealth {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getOldLocation(): IPoint
    getRadius(): number
    getMostRecentDirection(): Direction
    equipWeapon(weapon: IWeapon): void
    unequipWeapon(weapon: IWeapon): void
    getWeapon(): IWeapon
}
