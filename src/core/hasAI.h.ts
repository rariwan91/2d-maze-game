import { Player } from '.'

export interface IHasAI {
    aiTick(player: Player): void
}