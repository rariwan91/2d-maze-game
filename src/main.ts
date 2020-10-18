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
    // screen.drawRect({ x: 1, y: 1 }, { width: 100, height: 100 }, { r: 255, g: 0, b: 0 })
    // player.draw()
    // enemy.draw()
    // room.draw()

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)

    lastTime = Date.now()
    window.requestAnimationFrame(updateTick)
}

function updateTick(time: number) {
    player.update((time - lastTime) / 1000.0)
    // console.log((time - lastTime) / 1000.0)
    // enemy.update((time - lastTime) / 1000.0)
    lastTime = time
    window.requestAnimationFrame(updateTick)
}

// function endGame() {
//     clearInterval(loopInterval)
// }

function keydown(event: KeyboardEvent) {
    switch (event.key) {
        case Keycodes.ESC:
        case Keycodes.Q:
            // endGame()
            break
        case Keycodes.Up:
        case Keycodes.W:
            player.directionPressed(Direction.Up)
            break
        case Keycodes.Right:
        case Keycodes.D:
            player.directionPressed(Direction.Right)
            break
        case Keycodes.Down:
        case Keycodes.S:
            player.directionPressed(Direction.Down)
            break
        case Keycodes.Left:
        case Keycodes.A:
            player.directionPressed(Direction.Left)
            break
        // case 'space':
        //     shoot()
        // break
    }

    // if (key && key.ctrl && key.name == 'c') {
    //     endGame()
    // }
}

function keyup(event: KeyboardEvent) {
    switch (event.key) {
        case Keycodes.ESC:
        case Keycodes.Q:
            // endGame()
            break
        case Keycodes.Up:
        case Keycodes.W:
            player.directionReleased(Direction.Up)
            break
        case Keycodes.Right:
        case Keycodes.D:
            player.directionReleased(Direction.Right)
            break
        case Keycodes.Down:
        case Keycodes.S:
            player.directionReleased(Direction.Down)
            break
        case Keycodes.Left:
        case Keycodes.A:
            player.directionReleased(Direction.Left)
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