import { ICircle } from '../gui/circle.h'
import { IPoint } from '../gui/point.h'
import { IRectangle } from '../gui/rectangle.h'
import { ISize } from '../gui/size.h'

export function isPointValid(point: IPoint, screenSize: ISize) {
    return point.x >= 0 &&
        point.x <= screenSize.width &&
        point.y >= 0 &&
        point.y <= screenSize.height
}

export function isPointInRectangle(point: IPoint, rectangle: IRectangle) {
    return (
        point.x >= rectangle.location.x &&
        point.x <= (rectangle.location.x + rectangle.size.width) &&
        point.y >= rectangle.location.y &&
        point.y <= (rectangle.location.y + rectangle.size.height)
    )
}

export function isPointInCircle(point: IPoint, circle: ICircle) {
    const deltaX = point.x - circle.center.x
    const deltaY = point.y - circle.center.y
    return (Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) <= Math.pow(circle.radius, 2)
}
