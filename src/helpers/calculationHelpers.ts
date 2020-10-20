import { Direction } from '../core/direction.enum'
import { IPoint } from '../gui/point.h'

export function calculateVelocity(direction: Direction, maxSpeed: number): IPoint {
    if(direction === Direction.Up) {
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
    
    if(direction === Direction.Down) {
        return {
            x: 0,
            y: maxSpeed
        }
    }
    
    if(direction === Direction.Left) {
        return {
            x: -maxSpeed,
            y: 0
        }
    }
    
    if(direction === Direction.UpRight) {
        return {
            x: maxSpeed * Math.sin(45 * Math.PI / 180),
            y: -maxSpeed * Math.sin(45 * Math.PI / 180)
        }
    }
    
    if(direction === Direction.DownRight) {
        return {
            x: maxSpeed * Math.sin(45 * Math.PI / 180),
            y: maxSpeed * Math.sin(45 * Math.PI / 180)
        }
    }

    if(direction === Direction.DownLeft) {
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