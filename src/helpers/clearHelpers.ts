import { IMyScreen } from '../core/myScreen.h'
import { Colors } from '../gui/colors'
import { IPoint } from '../gui/point.h'

export function clearOldCollision(screen: IMyScreen, oldCollisionLocation: IPoint, collisionRadius: number) {
    screen.drawRect({
        x: oldCollisionLocation.x - collisionRadius - 2,
        y: oldCollisionLocation.y - collisionRadius - 2
    }, {
        width: 2 * collisionRadius + 4,
        height: 2 * collisionRadius + 4
    }, Colors.White, Colors.White)
}

export function clearOldCharacter(screen: IMyScreen, oldCharacterLocation: IPoint, characterRadius: number) {
    screen.drawArc(oldCharacterLocation, characterRadius + 2, 0, 360, Colors.White, Colors.White)
}

export function clearOldHealthBar(screen: IMyScreen, oldCharacterLocation: IPoint, characterRadius: number) {
    screen.drawRect({
        x: oldCharacterLocation.x - characterRadius - 1,
        y: oldCharacterLocation.y - characterRadius - 20 - 1
    }, {
        width: 2 * characterRadius + 2,
        height: 10 + 2
    }, Colors.White, Colors.White)
}