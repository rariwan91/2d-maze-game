import { Direction } from '../core'

export function getDirection(isUpPressed: boolean, isRightPressed: boolean, isDownPressed: boolean, isLeftPressed: boolean): Direction {
    const hasVerticalMovement = isUpPressed && !isDownPressed || !isUpPressed && isDownPressed
    const hasHorizontalMovement = isLeftPressed && !isRightPressed || !isLeftPressed && isRightPressed

    if (!hasHorizontalMovement && !hasVerticalMovement) return Direction.None

    if (!hasVerticalMovement && hasHorizontalMovement) {
        if (isLeftPressed) return Direction.Left
        return Direction.Right
    }

    if (hasVerticalMovement && !hasHorizontalMovement) {
        if (isUpPressed) return Direction.Up
        return Direction.Down
    }

    if (isUpPressed && isRightPressed) return Direction.UpRight
    if (isUpPressed && isLeftPressed) return Direction.UpLeft
    if (isDownPressed && isRightPressed) return Direction.DownRight
    return Direction.DownLeft
}
