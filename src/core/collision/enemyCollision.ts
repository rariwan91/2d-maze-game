import { CircleCollision } from './circleCollision'
import { IPoint } from '../../gui'
import { Entity } from '../entities/entity'

export class EnemyCollision extends CircleCollision {
    constructor(location: IPoint, radius: number, entity: Entity) {
        super(location, radius, entity)
    }
}
