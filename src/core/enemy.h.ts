import { IHasAI, IHasHealth, IUpdatable } from '.'
import { IDrawable } from '../gui'
import { IHasCollisions } from './collision'

export interface IEnemy extends IDrawable, IUpdatable, IHasCollisions, IHasAI, IHasHealth {

}