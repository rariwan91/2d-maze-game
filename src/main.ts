import { Game } from './core/game'

const canvas = <HTMLCanvasElement>document.getElementById('canvas')
const game = new Game(canvas)

window.addEventListener('keydown', (event: KeyboardEvent) => {
    game.keydown(event)
})
window.addEventListener('keyup', (event: KeyboardEvent) => {
    game.keyup(event)
})

function updateTick(time: number) {
    const keepGoing = game.updateTick(time)
    if (keepGoing) {
        animationFrame = window.requestAnimationFrame(updateTick)
    }
    else {
        window.cancelAnimationFrame(animationFrame)
    }
}

let animationFrame = window.requestAnimationFrame(updateTick)
