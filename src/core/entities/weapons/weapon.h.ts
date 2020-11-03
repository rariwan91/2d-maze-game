import { IDrawable } from '../../../gui'
import { IEnemy } from '../enemy.h'
import { IHasCollisions } from '../../collision'
import { IPlayer } from '..'
import { IUpdatable } from '../..'
import { WeaponState } from '.'

export interface IWeapon extends IDrawable, IUpdatable, IHasCollisions {
    attack(): void
    getState(): WeaponState
    attachToCharacter(character: IPlayer | IEnemy): void
    detachFromCharacter(): void
}
