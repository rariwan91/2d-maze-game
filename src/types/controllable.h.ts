import {Direction} from './direction.enum'

export interface IControllable {
    directionPressed(direction: Direction): void
    directionReleased(direction: Direction): void
}