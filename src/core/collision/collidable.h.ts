import { Entity } from '../entity'

export interface ICollidable {
    isColliding(shape: ICollidable): boolean
    isCollidingWithShapes(shapes: ICollidable[]): ICollidable[]
    getEntity(): Entity
}
