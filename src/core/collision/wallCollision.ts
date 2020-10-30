import { BoxCollision } from './boxCollision'
import { IPoint, ISize } from '../../gui'
import { Entity } from '../entities/entity'

export class WallCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize, entity: Entity) {
        super(location, size, entity)
    }
}
