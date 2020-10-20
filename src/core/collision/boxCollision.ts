import { CircleCollision } from './circleCollision'
import { ICollidable } from './collidable.h'
import { IPoint } from '../../gui/point.h'
import { ISize } from '../../gui/size.h'

export class BoxCollision implements ICollidable {
    protected _location: IPoint
    protected _size: ISize

    constructor(location: IPoint, size: ISize) {
        this._location = location
        this._size = size
    }

    public getLocation(): IPoint {
        return this._location
    }

    public getSize(): ISize {
        return this._size
    }

    public isColliding(shape: ICollidable): boolean {
        // Doing rectangle vs rectangle check for now while I figure out how to
        // actually do circle vs rectangle.
        if (shape instanceof CircleCollision) {
            // const aLoc = this._location
            // const aSize = this._size
            // const aRect: IRectangle = { location: aLoc, size: aSize }
            // const bLoc = shape.getLocation()
            // const bRadius = shape.getRadius()
            // const bRect: IRectangle = {
            //     location: {
            //         x: bLoc.x - bRadius,
            //         y: bLoc.y - bRadius
            //     },
            //     size: {
            //         height: 2 * bRadius,
            //         width: 2 * bRadius
            //     }
            // }

            // return (
            //     isPointInRectangle({ x: bRect.location.x, y: bRect.location.y }, aRect) ||
            //     isPointInRectangle({ x: bRect.location.x + bRect.size.width, y: bRect.location.y }, aRect) ||
            //     isPointInRectangle({ x: bRect.location.x, y: bRect.location.y + bRect.size.height }, aRect) ||
            //     isPointInRectangle({ x: bRect.location.x + bRect.size.width, y: bRect.location.y + bRect.size.height }, aRect)
            // )
        }
        else if (shape instanceof BoxCollision) {
            const aLoc = this._location
            const aSize = this._size
            const bLoc = shape.getLocation()
            const bSize = shape.getSize()

            if (aLoc.x + aSize.width < bLoc.x || bLoc.x + bSize.width < aLoc.x) return false
            if (aLoc.y + aSize.height < bLoc.y || bLoc.y + bSize.height < aLoc.y) return false
            return true
        }
        return false
    }

    public isCollidingWithShapes(shapes: ICollidable[]): ICollidable[] {
        const collidingShapes = shapes.filter(shape => {
            return this.isColliding(shape)
        })
        return collidingShapes
    }
}