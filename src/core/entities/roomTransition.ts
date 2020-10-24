import { IRoom, IRoomTransition, Player } from '.'
import { IMyScreen } from '../'
import { Config } from '../../config'
import { IPoint, ISize } from '../../gui'
import { BoxCollision, ICollidable } from '../collision'
import { Entity } from './entity'

export class RoomTransition extends Entity implements IRoomTransition {
    private _location: IPoint
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private _entitiesCollidingWithMe: Entity[] = []
    private _transitionBox: BoxCollision
    private _targetRoom: IRoom

    constructor(myScreen: IMyScreen, location: IPoint, size: ISize, targetRoom: IRoom) {
        super()
        this._myScreen = myScreen
        this._size = size
        this._location = location
        this._targetRoom = targetRoom
        this._transitionBox = new BoxCollision(this._location, this._size, this)
    }

    // ----------------------------------------
    //              IRoomTransition
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._location = newLocation
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        this._myScreen.drawRect(this._location, this._size, Config.Transitions.Color, Config.Transitions.Color)

        if (Config.Transitions.ShowCollisionBoxes) {
            const color = this.isColliding() ? Config.Collisions.YesCollisionColor : Config.Collisions.NoCollisionColor
            this._myScreen.drawRect(this._transitionBox.getLocation(), this._transitionBox.getSize(), color)
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(): void {
        if (this.isColliding()) {
            const event = new CustomEvent('onRoomTransitionTriggered', {
                detail: this._targetRoom
            })
            const eventTarget = document.getElementById('eventTarget')
            eventTarget.dispatchEvent(event)
        }
        else {
            this.draw()
        }
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._transitionBox]
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
            if (entity instanceof Player) {
                result = true
            }
        })
        return result
    }
}
