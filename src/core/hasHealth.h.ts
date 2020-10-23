import { Entity } from './entities/entity'

export interface IHasHealth {
    getMaxHealth(): number
    getCurrentHealth(): number
    takeDamage(amount: number): void
    registerOnDeathEvent(callback: (entity: Entity) => void): void
    unregisterOnDeathEvent(callback: (entity: Entity) => void): void
}
