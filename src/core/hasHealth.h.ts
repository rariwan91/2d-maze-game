export interface IHasHealth {
    getMaxHealth(): number
    getCurrentHealth(): number
    takeDamage(amount: number): void
}
