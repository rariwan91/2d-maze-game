import { IUpdatable } from ".."
import { IDrawable, IPoint } from "../../gui"
import { IHasCollisions } from "../collision"

export interface IRoomTransition extends IDrawable, IUpdatable, IHasCollisions {
    getLocation(): IPoint
    setLocation(newLocation: IPoint): void
}
