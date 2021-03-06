import { IPoint, IRectangle } from '../gui'

import { Direction } from '../core'

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
        x: playerLocation.x - offset2 * Math.cos(Math.PI / 4),
        y: playerLocation.y - playerRadius - offset1 - offset2 * Math.sin(Math.PI / 4)
    }
}

export function getDistanceBetween(point1: IPoint, point2: IPoint): number {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
}

export function getVectorDistanceBetween(point1: IPoint, point2: IPoint): IPoint {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y
    }
}

export function getMagnitude(point1: IPoint): number {
    return Math.sqrt(Math.pow(point1.x, 2) + Math.pow(point1.y, 2))
}

export function areRectanglesOverlapping(rectangle1: IRectangle, rectangle2: IRectangle): boolean {
    if (rectangle1.location.x + rectangle1.size.width < rectangle2.location.x || rectangle2.location.x + rectangle2.size.width < rectangle1.location.x) return false
    if (rectangle1.location.y + rectangle1.size.height < rectangle2.location.y || rectangle2.location.y + rectangle2.size.height < rectangle1.location.y) return false
    return true
}

export function addVectors(vector1: IPoint, vector2: IPoint): IPoint {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    }
}

export function subtractVectors(vector1: IPoint, vector2: IPoint): IPoint {
    return addVectors(vector1, {
        x: -vector2.x,
        y: -vector2.y
    })
}

export function offsetVector(vector: IPoint, amount: number): IPoint {
    return addVectors(vector, {
        x: amount,
        y: amount
    })
}
