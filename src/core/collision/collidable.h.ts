import { Entity } from '../entity'

export interface ICollidable {
    isColliding(collidable: ICollidable): boolean
    isCollidingWithShapes(collidables: ICollidable[]): ICollidable[]
    getEntity(): Entity
}
