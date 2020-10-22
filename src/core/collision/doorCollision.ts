import { IPoint, ISize } from '../../gui'
import { Entity } from '../entity'
import { BoxCollision } from './boxCollision'

export class DoorCollision extends BoxCollision {
    constructor(location: IPoint, size: ISize, entity: Entity) {
        super(location, size, entity)
    }
}
