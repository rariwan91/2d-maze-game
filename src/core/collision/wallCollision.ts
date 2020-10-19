import { IPoint, ISize } from '../../gui';
import { BoxCollision } from './';

export class WallCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize) {
        super(location, size)
    }
}
