import { ICollidable } from '.'

export interface IHasCollisions {
    getCollisionShapes(): ICollidable[]
    collisionStarted(shapes: ICollidable[]): void
    collisionEnded(): void
}
