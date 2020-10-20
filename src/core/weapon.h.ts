import { IPlayer, IUpdatable, WeaponState } from '.'
import { IDrawable } from '../gui'
import { IHasCollisions } from './collision'

export interface IWeapon extends IDrawable, IUpdatable, IHasCollisions {
    attack(): void
    getState(): WeaponState
    attachToPlayer(player: IPlayer): void
    detachFromPlayer(): void
}
