import { IPoint } from '../../gui'
import { Entity } from '../entity'
import { CircleCollision } from './circleCollision'

export class EnemyCollision extends CircleCollision {
    constructor(location: IPoint, radius: number, entity: Entity) {
        super(location, radius, entity)
    }
}
