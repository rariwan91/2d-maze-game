import { ICollidable } from './collidable.h';

export interface IHasCollisions {
    getCollisionShapes(): ICollidable[]
    checkForCollisionsWith(collidables: ICollidable[]): void
}
