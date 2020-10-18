import {Direction} from './direction.enum'

export interface IControllable {
    direction(direction: Direction): void
}