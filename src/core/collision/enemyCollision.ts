import { IPoint, ISize } from '../../gui';
import { CircleCollision } from './circleCollision'

export class EnemyCollision extends CircleCollision {
    constructor(location: IPoint, radius: number) {
        super(location, radius)
    }
}
