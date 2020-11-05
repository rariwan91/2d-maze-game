import { IDrawable, IPoint, IRectangle, ISize } from '../../gui'

import { IHasCollisions } from '../collision'
import { IUpdatable } from '..'

export interface IWall extends IDrawable, IUpdatable, IHasCollisions {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
    getSize(): ISize
    getRectangle(): IRectangle
}