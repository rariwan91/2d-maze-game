import { Player } from './player'

export interface IHasAI {
    aiTick(player: Player): void
}