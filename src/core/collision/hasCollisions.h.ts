import { ICollidable } from '.'

export interface IHasCollisions {
    getCollisionShapes(): ICollidable[]
    setCollisionEntityConcerns(collidables: ICollidable[]): void
}
