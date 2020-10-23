import { IRoom, IRoomTransition, Player } from '.'
import { IMyScreen } from '../'
import { Config } from '../../config'
import { Colors, IPoint, ISize } from '../../gui'
import { BoxCollision, ICollidable } from '../collision'
import { Entity } from './entity'

export class RoomTransition extends Entity implements IRoomTransition {
    private readonly _location: IPoint
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private readonly _noCollisionsColor = Colors.Blue
    private readonly _yesCollisionsColor = Colors.Yellow
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
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        if (Config.Transitions.ShowTransitionBoxes) {
            const color = this.isColliding() ? this._yesCollisionsColor : this._noCollisionsColor
            this._myScreen.drawRect(this._transitionBox.getLocation(), this._transitionBox.getSize(), color, color)
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
