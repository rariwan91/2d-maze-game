import { Entity } from './entities/entity'

export interface IHasHealth {
    getMaxHealth(): number
    getCurrentHealth(): number
    takeDamage(amount: number): void
}
