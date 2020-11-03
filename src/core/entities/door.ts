import { DoorCollision, ICollidable } from '../collision'
import { IDoor, IRoom } from '.'
import { IPoint, ISize, Keycode } from '../../gui'

import { BoxCollision } from '../collision/boxCollision'
import { Config } from '../../config'
import { Entity } from './entity'
import { IMyScreen } from '..'
import { Player } from './player'

export class Door extends Entity implements IDoor {
    private readonly _room: IRoom
    private _location: IPoint
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private readonly _doorCollision: DoorCollision
    private readonly _activationBox: BoxCollision
    private _entitiesCollidingWithMe: Entity[] = []
    private _entitiesActivatingMe: Entity[] = []
    private _opened = false
    private _locked = false

    constructor(myScreen: IMyScreen, location: IPoint, size: ISize, room: IRoom) {
        super()
        this._myScreen = myScreen
        this._size = size
        this._location = location
        this._room = room
        this._doorCollision = new DoorCollision(this._location, this._size, this)
        this._activationBox = new BoxCollision({ x: this._location.x - 40, y: this._location.y - 40 }, { width: this._size.width + 80, height: this._size.height + 80 }, this)
    }

    // ----------------------------------------
    //              IRoom
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._location = newLocation
        this._doorCollision.setLocation(newLocation)
        this._activationBox.setLocation({ x: this._location.x - 40, y: this._location.y - 40 })
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        if (!this._opened) {
            this._myScreen.drawRect(this._location, this._size, Config.Doors.MainColor, Config.Doors.MainColor)

            if (this._size.width > this._size.height) {
                this._myScreen.drawStraightLine({ x: this._location.x + this._size.width / 6, y: this._location.y }, { x: this._location.x + this._size.width / 6, y: this._location.y + this._size.height }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x + 2 * this._size.width / 6, y: this._location.y }, { x: this._location.x + 2 * this._size.width / 6, y: this._location.y + this._size.height }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x + 3 * this._size.width / 6, y: this._location.y }, { x: this._location.x + 3 * this._size.width / 6, y: this._location.y + this._size.height }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x + 4 * this._size.width / 6, y: this._location.y }, { x: this._location.x + 4 * this._size.width / 6, y: this._location.y + this._size.height }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x + 5 * this._size.width / 6, y: this._location.y }, { x: this._location.x + 5 * this._size.width / 6, y: this._location.y + this._size.height }, Config.Doors.SecondaryColor)
            }
            else {
                this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + this._size.height / 6 }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height / 6 }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 2 * this._size.height / 6 }, { x: this._location.x + this._size.width, y: this._location.y + 2 * this._size.height / 6 }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 3 * this._size.height / 6 }, { x: this._location.x + this._size.width, y: this._location.y + 3 * this._size.height / 6 }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 4 * this._size.height / 6 }, { x: this._location.x + this._size.width, y: this._location.y + 4 * this._size.height / 6 }, Config.Doors.SecondaryColor)
                this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 5 * this._size.height / 6 }, { x: this._location.x + this._size.width, y: this._location.y + 5 * this._size.height / 6 }, Config.Doors.SecondaryColor)
            }

            if (this._locked) {
                this._myScreen.drawRect({ x: this._location.x + this._size.width / 2 - 5, y: this._location.y + this._size.height / 2 - 6 }, { width: 10, height: 10 }, Config.Doors.TertiaryColor, Config.Doors.TertiaryColor)
                this._myScreen.drawEquilateralTriange({ x: this._location.x + this._size.width / 2, y: this._location.y + this._size.height / 2 + 5 }, 7, Config.Doors.TertiaryColor, Config.Doors.TertiaryColor)
            }
        }

        if (Config.Doors.ShowCollisionBoxes) {
            const isColliding = this.isColliding()
            this._myScreen.drawRect(this._doorCollision.getLocation(), this._doorCollision.getSize(), isColliding ? Config.Collisions.YesCollisionColor : Config.Collisions.NoCollisionColor)
        }

        if (Config.Doors.ShowActivationBoxes) {
            const isActivated = this.isActivated()
            this._myScreen.drawRect(this._activationBox.getLocation(), this._activationBox.getSize(), isActivated ? Config.Collisions.YesCollisionColor : Config.Collisions.NoCollisionColor)
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
                if (!entitiesCollidingWithMe.includes(entity) && entity !== this as Entity) 
                    entitiesCollidingWithMe.push(entity)
                
            }
            if (!isActivating || isActivating.length > 0) {
                const entity = collidable.getEntity()
                if (!entitiesActivatingMe.includes(entity) && entity !== this as Entity) 
                    entitiesActivatingMe.push(entity)
                
            }
        })

        this._entitiesCollidingWithMe = entitiesCollidingWithMe
        this._entitiesActivatingMe = entitiesActivatingMe
    }

    // ----------------------------------------
    //              IRespondsToInput
    // ----------------------------------------

    public keyPressed(keyCode: Keycode): void {
        if (!this.isActivated()) return

        if (keyCode === Keycode.E) 
            if (!this._locked) {
                this._opened = true
                this._room.doorOpened(this)
            }
        
    }

    public keyReleased(keyCode: Keycode): void {
        keyCode
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private isColliding(): boolean {
        let result = false
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Player) 
                result = true
            
        })
        return result
    }

    private isActivated(): boolean {
        let result = false
        this._entitiesActivatingMe.forEach(entity => {
            if (entity instanceof Player) 
                result = true
            
        })
        return result
    }
}
