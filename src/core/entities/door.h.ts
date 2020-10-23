import { IRespondsToInput, IUpdatable } from ".."
import { IDrawable } from "../../gui"
import { IHasCollisions } from "../collision";

export interface IDoor extends IDrawable, IUpdatable, IHasCollisions, IRespondsToInput {

}