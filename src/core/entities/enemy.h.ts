import { Direction, IHasAI, IHasHealth, IUpdatable } from '../'
import { IDrawable, IPoint } from '../../gui'
import { IHasActivations, IHasCollisions } from '../collision'
import { IRoom } from './room.h'
import { IWeapon } from './weapon.h'

export interface IEnemy extends IDrawable, IUpdatable, IHasCollisions, IHasAI, IHasHealth, IHasActivations {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getOldLocation(): IPoint
    setOldLocation(newOldLocation: IPoint): void
    getDirection(): Direction
    getMostRecentDirection(): Direction
    getRadius(): number
    setRoom(newRoom: IRoom): void
    equipWeapon(weapon: IWeapon): void
    unequipWeapon(weapon: IWeapon): void
}
