import { IPoint } from '../../gui/point.h'
import { ISize } from '../../gui/size.h'
import { BoxCollision } from './'

export class WallCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize) {
        super(location, size)
    }
}
