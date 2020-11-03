import { CircleCollision } from './circleCollision'
import { Entity } from '../entities/entity'
import { IPoint } from '../../gui'

export class EnemyCollision extends CircleCollision {
    constructor(location: IPoint, radius: number, entity: Entity) {
        super(location, radius, entity)
    }
}
