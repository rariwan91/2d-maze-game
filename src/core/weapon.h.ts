import { IDrawable } from '../gui/drawable.h'
import { IUpdatable } from './updatable.h'
import { WeaponState } from './weaponState.enum'

export interface IWeapon extends IDrawable, IUpdatable {
    attack(): void
    getState(): WeaponState
}
