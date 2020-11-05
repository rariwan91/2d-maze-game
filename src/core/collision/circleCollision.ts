import { BoxCollision } from './boxCollision'
import { Entity } from '../entities/entity'
import { ICollidable } from '.'
import { IPoint } from '../../gui'
import { areRectanglesOverlapping } from '../../helpers/calculationHelpers'

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
            return areRectanglesOverlapping({ location: aLoc, size: aSize }, { location: bLoc, size: bSize })
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