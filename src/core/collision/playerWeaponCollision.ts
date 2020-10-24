import { CircleCollision } from '.'
import { IPoint } from '../../gui'
import { Entity } from '../entities/entity'

export class PlayerWeaponCollision extends CircleCollision {
    constructor(location: IPoint, radius: number, entity: Entity) {
        super(location, radius, entity)
    }
}
