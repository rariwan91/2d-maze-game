import { ICollidable } from './collidable.h'

export interface IHasCollisions {
    getCollisionShapes(): ICollidable[]
    collisionStarted(shapes: ICollidable[]): void
    collisionEnded(): void
}
