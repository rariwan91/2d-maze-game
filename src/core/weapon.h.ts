import { IUpdatable, WeaponState } from '.'
import { IDrawable } from '../gui'

export interface IWeapon extends IDrawable, IUpdatable {
    attack(): void
    getState(): WeaponState
}
