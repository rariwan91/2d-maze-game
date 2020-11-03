import { ICollidable } from '.'

export interface IHasActivations {
    getActivationShapes(): ICollidable[]
    checkForActivationsWith(collidables: ICollidable[]): void
}
