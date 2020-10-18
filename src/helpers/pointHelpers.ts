import { IPoint, ISize } from '../gui'

export function isPointValid(point: IPoint, screenSize: ISize) {
    return point.x >= 0 &&
        point.x <= screenSize.width &&
        point.y >= 0 &&
        point.y <= screenSize.height
}
