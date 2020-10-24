import { BoxCollision } from '.'
import { IPoint, ISize } from '../../gui'
import { Entity } from '../entities/entity'

export class DoorCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize, entity: Entity) {
        super(location, size, entity)
    }
}
