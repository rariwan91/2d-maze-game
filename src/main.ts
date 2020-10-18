import { Direction, Enemy, Keycodes, MyScreen, Player, Room } from './types'

let screen: MyScreen
// let room: Room
let player: Player
// let enemy: Player
let lastTime: number

function startGame() {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    screen = new MyScreen(canvas)
    player = new Player(screen.getSize(), screen)

    screen.clearScreen()
    screen.drawRect({ x: 1, y: 1 }, { width: 100, height: 100 }, { r: 255, g: 0, b: 0 })
    player.draw()
    // enemy.draw()
    // room.draw()

    window.addEventListener('keydown', keydown)

    lastTime = Date.now()
    window.requestAnimationFrame(updateTick)
}

function updateTick(time: number): void {
    player.update(time - lastTime)
    // enemy.update(time - lastTime)
    lastTime = time//Date.now()
    window.requestAnimationFrame(updateTick)
}

// function endGame() {
//     clearInterval(loopInterval)
// }

function keydown(event: KeyboardEvent) {
    console.log(event.key === Keycodes.A)
    switch (event.key) {
        case Keycodes.ESC:
        case Keycodes.Q:
            // endGame()
            break
        case Keycodes.Up:
        case Keycodes.W:
            player.direction(Direction.Up)
            break
        case Keycodes.Right:
        case Keycodes.D:
            player.direction(Direction.Right)
            break
        case Keycodes.Down:
        case Keycodes.S:
            player.direction(Direction.Down)
            break
        case Keycodes.Left:
        case Keycodes.A:
            player.direction(Direction.Left)
            break
        // case 'space':
        //     shoot()
        // break
    }

    // if (key && key.ctrl && key.name == 'c') {
    //     endGame()
    // }
}

startGame()