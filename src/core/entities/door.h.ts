import { IDrawable, IPoint } from '../../gui'
import { IRespondsToInput, IUpdatable } from '..'

import { IHasCollisions } from '../collision'

export interface IDoor extends IDrawable, IUpdatable, IHasCollisions, IRespondsToInput {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
}
