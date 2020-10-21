import { Direction } from '../core'
import { IPoint } from '../gui'

export function calculateVelocity(direction: Direction, maxSpeed: number): IPoint {
    if (direction === Direction.Up) {
        return {
            x: 0,
            y: -maxSpeed
        }
    }

    if (direction === Direction.Right) {
        return {
            x: maxSpeed,
            y: 0
        }
    }

    if (direction === Direction.Down) {
        return {
            x: 0,
            y: maxSpeed
        }
    }

    if (direction === Direction.Left) {
        return {
            x: -maxSpeed,
            y: 0
        }
    }

    if (direction === Direction.UpRight) {
        return {
            x: maxSpeed * Math.sin(45 * Math.PI / 180),
            y: -maxSpeed * Math.sin(45 * Math.PI / 180)
        }
    }

    if (direction === Direction.DownRight) {
        return {
            x: maxSpeed * Math.sin(45 * Math.PI / 180),
            y: maxSpeed * Math.sin(45 * Math.PI / 180)
        }
    }

    if (direction === Direction.DownLeft) {
        return {
            x: -maxSpeed * Math.sin(45 * Math.PI / 180),
            y: maxSpeed * Math.sin(45 * Math.PI / 180)
        }
    }

    return {
        x: -maxSpeed * Math.sin(45 * Math.PI / 180),
        y: -maxSpeed * Math.sin(45 * Math.PI / 180)
    }
}

export function calculateNewPosition(currentLocation: IPoint, currentVelocity: IPoint, deltaTime: number): IPoint {
    return {
        x: currentLocation.x + currentVelocity.x * deltaTime,
        y: currentLocation.y + currentVelocity.y * deltaTime
    }
}

export function calculateSwordStartPoint(playerLocation: IPoint, playerDirection: Direction, playerRadius: number, offset1: number, offset2: number): IPoint {
    if (playerDirection === Direction.Up) {
        return {
            x: playerLocation.x + (playerRadius + offset1) * Math.cos(Math.PI / 4),
            y: playerLocation.y - (playerRadius + offset1) * Math.sin(Math.PI / 4) - offset2,
        }
    }

    if (playerDirection === Direction.UpRight) {
        return {
            x: playerLocation.x + playerRadius + offset1 + offset2 * Math.cos(Math.PI / 4),
            y: playerLocation.y - offset2 * Math.sin(Math.PI / 4)
        }
    }

    if (playerDirection === Direction.Right) {
        return {
            x: playerLocation.x + (playerRadius + offset1) * Math.cos(Math.PI / 4) + offset2,
            y: playerLocation.y + (playerRadius + offset1) * Math.sin(Math.PI / 4),
        }
    }

    if (playerDirection === Direction.DownRight) {
        return {
            x: playerLocation.x + offset2 * Math.cos(Math.PI / 4),
            y: playerLocation.y + playerRadius + offset1 + offset2 * Math.sin(Math.PI / 4)
        }
    }

    if (playerDirection === Direction.Down) {
        return {
            x: playerLocation.x - (playerRadius + offset1) * Math.cos(Math.PI / 4),
            y: playerLocation.y + (playerRadius + offset1) * Math.sin(Math.PI / 4) + offset2,
        }
    }

    if (playerDirection === Direction.DownLeft) {
        return {
            x: playerLocation.x - playerRadius - offset1 - offset2 * Math.cos(Math.PI / 4),
            y: playerLocation.y + offset2 * Math.sin(Math.PI / 4)
        }
    }

    if (playerDirection === Direction.Left) {
        return {
            x: playerLocation.x - (playerRadius + offset1) * Math.cos(Math.PI / 4) - offset2,
            y: playerLocation.y - (playerRadius + offset1) * Math.sin(Math.PI / 4),
        }
    }

    // Direction.UpLeft
    return {
        x: playerLocation.x  - offset2 * Math.cos(Math.PI / 4),
        y: playerLocation.y - playerRadius - offset1 - offset2 * Math.sin(Math.PI / 4)
    }
}
