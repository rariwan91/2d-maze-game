import { Game } from './types/game'

const canvas = <HTMLCanvasElement>document.getElementById('canvas')
const game = new Game(canvas)

window.addEventListener('keydown', (event: KeyboardEvent) => {
    game.keydown(event)
})
window.addEventListener('keyup', (event: KeyboardEvent) => {
    game.keyup(event)
})

function updateTick(time: number) {
    game.updateTick(time)
    window.requestAnimationFrame(updateTick)
}
window.requestAnimationFrame(updateTick)
