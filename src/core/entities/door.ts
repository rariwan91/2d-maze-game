import { IMyScreen } from '../'
import { IDoor } from '.'
import { Entity } from './entity'
import { Colors, IPoint, ISize, Keycode } from '../../gui'
import { BoxCollision, CollisionConfig, DoorCollision, ICollidable } from './../collision'
import { Player } from './player'

export class Door extends Entity implements IDoor {
    private readonly _location: IPoint
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private readonly _doorCollision: DoorCollision
    private readonly _activationBox: BoxCollision
    private readonly _mainColor = Colors.Brown
    private readonly _secondaryColor = Colors.Black
    private readonly _noCollisionsColor = Colors.Green
    private readonly _yesCollisionsColor = Colors.Red
    private _entitiesCollidingWithMe: Entity[] = []
    private _entitiesActivatingMe: Entity[] = []
    private _opened = false
    private _locked = false

    constructor(myScreen: IMyScreen, location: IPoint, size: ISize) {
        super()
        this._myScreen = myScreen
        this._size = size
        this._location = location
        this._doorCollision = new DoorCollision(this._location, this._size, this)
        this._activationBox = new BoxCollision({ x: this._location.x - 25, y: this._location.y - 25 }, { width: this._size.width + 50, height: this._size.height + 50 }, this)
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        if (!this._opened) {
            this._myScreen.drawRect(this._location, this._size, this._mainColor, this._mainColor)
            if(this._locked) {
                this._myScreen.drawRect({ x: this._location.x + this._size.width / 2 - 5, y: this._location.x + this._size.height / 2  -5 }, { width: 10, height: 10 }, this._secondaryColor, this._secondaryColor)
            }
        }

        if (CollisionConfig) {
            if (CollisionConfig.Rooms.ShowDoorCollisionBoxes) {
                const isColliding = this.isColliding()
                const isActivated = this.isActivated()
                this._myScreen.drawRect(this._doorCollision.getLocation(), this._doorCollision.getSize(), isColliding ? this._yesCollisionsColor : this._noCollisionsColor)
                this._myScreen.drawRect(this._activationBox.getLocation(), this._activationBox.getSize(), isActivated ? this._yesCollisionsColor : this._noCollisionsColor)
            }
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
        return [this._doorCollision]
    }

    private getActivationShapes(): ICollidable[] {
        return [this._activationBox]
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entitiesCollidingWithMe: Entity[] = []
        const entitiesActivatingMe: Entity[] = []

        collidables.forEach(collidable => {
            const isColliding = collidable.isCollidingWithShapes(this.getCollisionShapes())
            const isActivating = collidable.isCollidingWithShapes(this.getActivationShapes())
            if (!isColliding || isColliding.length > 0) {
                const entity = collidable.getEntity()
                if (!entitiesCollidingWithMe.includes(entity) && entity !== this as Entity) {
                    entitiesCollidingWithMe.push(entity)
                }
            }
            if (!isActivating || isActivating.length > 0) {
                const entity = collidable.getEntity()
                if (!entitiesActivatingMe.includes(entity) && entity !== this as Entity) {
                    entitiesActivatingMe.push(entity)
                }
            }
        })

        this._entitiesCollidingWithMe = entitiesCollidingWithMe
        this._entitiesActivatingMe = entitiesActivatingMe
    }

    // ----------------------------------------
    //              IRespondsToInput
    // ----------------------------------------

    public keyPressed(keyCode: Keycode) {
        if (keyCode === Keycode.ENTER) {
            console.log('player pressed enter and the door saw it')
        }
    }

    public keyReleased(keyCode: Keycode) {
        if (keyCode === Keycode.ENTER) {
            console.log('enter released')
        }
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private isColliding(): boolean {
        let result = false
        this._entitiesCollidingWithMe.forEach(entity => {
            if(entity instanceof Player) {
                result = true
            }
        })
        return result
    }

    private isActivated(): boolean {
        let result = false
        this._entitiesActivatingMe.forEach(entity => {
            if(entity instanceof Player) {
                result = true
            }
        })
        return result
    }
}
