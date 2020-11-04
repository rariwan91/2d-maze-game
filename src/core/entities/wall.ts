import { IPoint, ISize } from '../../gui'
import { IWall, Player } from '.'

import { BoxCollision } from '../collision/boxCollision'
import { Config } from '../../config'
import { Enemy } from './enemy'
import { Entity } from './entity'
import { ICollidable } from '../collision'
import { IMyScreen } from '..'

export class Wall extends Entity implements IWall {
    private _location: IPoint
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private _entitiesCollidingWithMe: Entity[] = []
    private _boxCollision: BoxCollision

    constructor(myScreen: IMyScreen, location: IPoint, size: ISize) {
        super()
        this._myScreen = myScreen
        this._size = size
        this._location = location
        this._boxCollision = new BoxCollision(this._location, this._size, this)
    }

    // ----------------------------------------
    //              IWall
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._location = newLocation
        this._boxCollision.setLocation(newLocation)
    }

    public getSize(): ISize {
        return this._size
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        this._myScreen.drawRect(this._location, this._size, Config.Walls.OutlineColor, Config.Walls.FillColor)

        if (Config.Walls.ShowCollisionBoxes) {
            const color = this.isColliding() ? Config.Collisions.YesCollisionColor : Config.Collisions.NoCollisionColor
            this._myScreen.drawRect(this._boxCollision.getLocation(), this._boxCollision.getSize(), color)
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(): void {
        this.draw()
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._boxCollision]
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []
        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this.getCollisionShapes())
            if (!result || result.length > 0) {
                const entity = collidable.getEntity()
                if (!entities.includes(entity) && entity !== this as Entity) {
                    entities.push(entity)
                }
            }
        })

        this._entitiesCollidingWithMe = entities
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private isColliding(): boolean {
        let result = false
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Player || entity instanceof Enemy) {
                result = true
            }
        })
        return result
    }
}
