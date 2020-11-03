import { IPoint, ISize } from '../../gui'

import { BoxCollision } from './boxCollision'
import { Entity } from '../entities/entity'

export class DoorCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize, entity: Entity) {
        super(location, size, entity)
    }
}
