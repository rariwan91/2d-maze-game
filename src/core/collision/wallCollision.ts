import { IPoint, ISize } from '../../gui'
import { BoxCollision } from './boxCollision'

export class WallCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize) {
        super(location, size)
    }
}
