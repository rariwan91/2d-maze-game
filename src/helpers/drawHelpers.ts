import { Direction, IMyScreen } from "../core";
import { Colors, IColor, IPoint } from "../gui";

export function drawCharacter(screen: IMyScreen, location: IPoint, radius: number, direction: Direction, mainColor: IColor, secondaryColor: IColor) {
    // draw character circle
    screen.drawArc(location, radius, 0, 360, mainColor, mainColor)

    // draw character direction arc
    let startAngle = 0
    let endAngle = 90
    if (direction === Direction.Up) {
        startAngle = 45
        endAngle = 135
    }
    else if (direction === Direction.Right) {
        startAngle = -45
        endAngle = 45
    }
    else if (direction === Direction.Down) {
        startAngle = 225
        endAngle = 315
    }
    else if (direction === Direction.Left) {
        startAngle = 135
        endAngle = 225
    }
    else if (Direction.UpRight) {
        startAngle = 0
        endAngle = 90
    }
    else if (Direction.DownRight) {
        startAngle = -90
        endAngle = 0
    }
    else if (Direction.DownLeft) {
        startAngle = 180
        endAngle = 270
    }
    else {
        startAngle = 90
        endAngle = 180
    }
    screen.drawArc(location, radius, startAngle, endAngle, secondaryColor, secondaryColor)
}

export function drawCollision(screen: IMyScreen, collisionLocation: IPoint, collisionRadius: number, yesColor: IColor, noColor: IColor, isColliding: boolean) {
    if (isColliding) {
        screen.drawRect({
            x: collisionLocation.x - collisionRadius,
            y: collisionLocation.y - collisionRadius
        }, {
            width: 2 * collisionRadius,
            height: 2 * collisionRadius
        }, yesColor)
        screen.drawArc(collisionLocation, collisionRadius, 0, 360, yesColor)
    }
    else {
        screen.drawRect({
            x: collisionLocation.x - collisionRadius,
            y: collisionLocation.y - collisionRadius
        }, {
            width: 2 * collisionRadius,
            height: 2 * collisionRadius
        }, noColor)
        screen.drawArc(collisionLocation, collisionRadius, 0, 360, noColor)
    }
}

export function drawHealthBar(screen: IMyScreen, characterLocation: IPoint, characterRadius: number, characterMaxHealth: number, characterCurrentHealth: number) {
    screen.drawRect({
        x: characterLocation.x - characterRadius,
        y: characterLocation.y - characterRadius - 20
    }, {
        width: 2 * characterRadius,
        height: 10
    }, Colors.Black, Colors.Red)

    if (characterCurrentHealth !== 0) {
        screen.drawRect({
            x: characterLocation.x - characterRadius + 2,
            y: characterLocation.y - characterRadius - 20 + 2
        }, {
            width: (2 * characterRadius - 4) * (characterCurrentHealth / characterMaxHealth),
            height: 10 - 4
        }, Colors.Green, Colors.Green)
    }
}
