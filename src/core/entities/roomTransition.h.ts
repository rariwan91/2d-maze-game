import { IUpdatable } from ".."
import { IDrawable } from "../../gui"
import { IHasCollisions } from "../collision"

export interface IRoomTransition extends IDrawable, IUpdatable, IHasCollisions {

}