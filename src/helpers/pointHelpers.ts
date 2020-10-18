import { IPoint } from '../types/point.h'
import { ISize } from '../types/size.h'

export function isPointValid(point: IPoint, screenSize: ISize) {
    return point.x >= 0 &&
        point.x <= screenSize.width &&
        point.y >= 0 &&
        point.y <= screenSize.height
}
