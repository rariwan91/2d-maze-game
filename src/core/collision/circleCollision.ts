import { IPoint } from '../../gui'
import { Entity } from '../entity'
import { BoxCollision } from './boxCollision'
import { ICollidable } from './collidable.h'

export class CircleCollision implements ICollidable {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number
    protected readonly _entity: Entity

    constructor(location: IPoint, radius: number, entity: Entity) {
        this._location = location
        this._oldLocation = location
        this._radius = radius
        this._entity = entity
    }

    public getEntity(): Entity {
        return this._entity
    }

    public getLocation(): IPoint {
        return this._location
    }

    public getOldLocation(): IPoint {
        return this._oldLocation
    }

    public setLocation(location: IPoint): void {
        this._oldLocation = this._location
        this._location = location
    }

    public getRadius(): number {
        return this._radius
    }

    isColliding(shape: ICollidable): boolean {
        // If the circles' centers are within their combined radius of each other then we have collision
        if (shape instanceof CircleCollision) {
            const deltaX = shape.getLocation().x - this._location.x
            const deltaY = shape.getLocation().y - this._location.y
            const totalRadius = shape.getRadius() + this._radius
            return (Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) <= Math.pow(totalRadius, 2)
        }
        // Doing rectangle vs rectangle check for now while I figure out how to
        // actually do circle vs rectangle.
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