import { ICollidable } from '.'

export interface IHasCollisions {
    getCollisionShapes(): ICollidable[]
    checkForCollisionsWith(collidables: ICollidable[]): void
}
