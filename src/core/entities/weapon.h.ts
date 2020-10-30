import { IUpdatable } from '../'
import { IPlayer, WeaponState } from '.'
import { IDrawable } from '../../gui'
import { IHasCollisions } from './../collision'
import { IEnemy } from './enemy.h'

export interface IWeapon extends IDrawable, IUpdatable, IHasCollisions {
    attack(): void
    getState(): WeaponState
    attachToCharacter(character: IPlayer | IEnemy): void
    detachFromCharacter(): void
}
