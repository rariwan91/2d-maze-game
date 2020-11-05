import { IPoint, ISize } from '../../gui'

import { CircleCollision } from './circleCollision'
import { Entity } from '../entities/entity'
import { ICollidable } from '.'
import { areRectanglesOverlapping } from '../../helpers'

export class BoxCollision implements ICollidable {
    protected _location: IPoint
    protected _size: ISize
    protected readonly _entity: Entity

    constructor(location: IPoint, size: ISize, entity: Entity) {
        this._location = location
        this._size = size
        this._entity = entity
    }

    // ----------------------------------------
    //              ICollidable
    // ----------------------------------------

    public isColliding(shape: ICollidable): boolean {
        // Doing rectangle vs rectangle check for now while I figure out how to
        // actually do circle vs rectangle.
        if (shape instanceof CircleCollision) {
            const aLoc = this._location
            const aSize = this._size
            const bLoc = {
                x: shape.getLocation().x - shape.getRadius(),
                y: shape.getLocation().y - shape.getRadius()
            }
            const bSize = {
                width: 2 * shape.getRadius(),
                height: 2 * shape.getRadius()
            }
            return areRectanglesOverlapping({ location: aLoc, size: aSize }, { location: bLoc, size: bSize })
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

    public getEntity(): Entity {
        return this._entity
    }

    // ----------------------------------------
    //              public
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._location = newLocation
    }

    public getSize(): ISize {
        return this._size
    }
}