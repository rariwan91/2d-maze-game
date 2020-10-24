import { BoxCollision, ICollidable } from '.'
import { IPoint } from '../../gui'
import { getDistanceBetween } from '../../helpers/calculationHelpers'
import { Entity } from '../entities/entity'

export class CircleCollision implements ICollidable {
    private _location: IPoint
    private readonly _radius: number
    protected readonly _entity: Entity

    constructor(location: IPoint, radius: number, entity: Entity) {
        this._location = location
        this._radius = radius
        this._entity = entity
    }

    // ----------------------------------------
    //              ICollidable
    // ----------------------------------------

    isColliding(shape: ICollidable): boolean {
        // If the circles' centers are within their combined radius of each other then we have collision
        if (shape instanceof CircleCollision) {
            const deltaX = shape.getLocation().x - this._location.x
            const deltaY = shape.getLocation().y - this._location.y
            const totalRadius = shape.getRadius() + this._radius
            return (Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) <= Math.pow(totalRadius, 2)
        }
        // Doing rectangle vs rectangle check and then a rectangle vs circle check
        else if (shape instanceof BoxCollision) {
            const aLoc = {
                x: this._location.x - this._radius,
                y: this._location.y - this._radius
            }
            const aSize = {
                width: 2 * this._radius,
                height: 2 * this._radius
            }
            const bLoc = shape.getLocation()
            const bSize = shape.getSize()

            if (aLoc.x + aSize.width < bLoc.x || bLoc.x + bSize.width < aLoc.x) return false
            if (aLoc.y + aSize.height < bLoc.y || bLoc.y + bSize.height < aLoc.y) return false

            // If the center of the circle is beyond the bounds of the rectangle do a
            // check to see if the corner of the rectangle is within the circle
            if (this._location.x > bLoc.x + bSize.width || this._location.x < bLoc.x) {
                const shortestDistance = Math.min(
                    getDistanceBetween(this._location, bLoc),
                    getDistanceBetween(this._location, { x: bLoc.x + bSize.width, y: bLoc.y }),
                    getDistanceBetween(this._location, { x: bLoc.x + bSize.width, y: bLoc.y + bSize.height }),
                    getDistanceBetween(this._location, { x: bLoc.x, y: bLoc.y + bSize.height })
                )
                if (shortestDistance < this._radius) return true
            }

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

    public setLocation(location: IPoint): void {
        this._location = location
    }

    public getRadius(): number {
        return this._radius
    }
}