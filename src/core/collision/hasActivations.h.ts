import { ICollidable } from '.'

export interface IHasActivations {
    getActivationShapes(): ICollidable[]
    setActivationEntityConcerns(collidables: ICollidable[]): void
}
