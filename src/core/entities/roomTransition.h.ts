import { IDrawable, IPoint } from '../../gui'

import { IHasCollisions } from '../collision'
import { IUpdatable } from '..'

export interface IRoomTransition extends IDrawable, IUpdatable, IHasCollisions {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
}
