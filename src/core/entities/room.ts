import { Door, IDoor, IRoom } from '.'
import { Direction, IMyScreen } from '../'
import { Config } from '../../config'
import { IPoint, ISize } from '../../gui'
import { getVectorDistanceBetween } from '../../helpers'
import { ICollidable, WallCollision } from './../collision'
import { Entity } from './entity'
import { RoomTransition } from './roomTransition'
import { IRoomTransition } from './roomTransition.h'

export class Room extends Entity implements IRoom {
    private _location: IPoint = { x: 50, y: 50 }
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private _walls: WallCollision[] = []
    private _entitiesCollidingWithMe: Entity[] = []
    private _roomToNorth: IRoom
    private _roomToRight: IRoom
    private _roomToSouth: IRoom
    private _roomToLeft: IRoom
    private _northDoor: IDoor
    private _rightDoor: IDoor
    private _southDoor: IDoor
    private _leftDoor: IDoor
    private _northRoomTransition: IRoomTransition
    private _rightRoomTransition: IRoomTransition
    private _southRoomTransition: IRoomTransition
    private _leftRoomTransition: IRoomTransition

    constructor(myScreen: IMyScreen) {
        super()
        this._myScreen = myScreen
        this._size = {
            width: myScreen.getSize().width - 100,
            height: myScreen.getSize().height - 100
        }
        this.createWallCollisions()
    }

    // ----------------------------------------
    //              IRoom
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        const difference = getVectorDistanceBetween(this._location, newLocation)
        this._location = newLocation
        this._walls.forEach(w => {
            const wLoc = w.getLocation()
            w.setLocation({ x: wLoc.x + difference.x, y: wLoc.y + difference.y })
        })

        if (this._northDoor) {
            this._northDoor.setLocation(this.getDoorLocation(Direction.Up))
        }

        if (this._leftDoor) {
            this._leftDoor.setLocation(this.getDoorLocation(Direction.Left))
        }

        if (this._southDoor) {
            this._southDoor.setLocation(this.getDoorLocation(Direction.Down))
        }

        if (this._rightDoor) {
            this._rightDoor.setLocation(this.getDoorLocation(Direction.Right))
        }

        if (this._northRoomTransition) {
            this._northRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Up))
        }

        if (this._rightRoomTransition) {
            this._rightRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Right))
        }

        if (this._southRoomTransition) {
            this._southRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Down))
        }

        if (this._leftRoomTransition) {
            this._leftRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Left))
        }
    }

    public getSize(): ISize {
        return this._size
    }

    public pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Left | Direction.Right, room: IRoom): void {
        this.setRoomExit(myExitDirection, room)
        let theirExitDirection: Direction
        if (myExitDirection === Direction.Up) {
            theirExitDirection = Direction.Down
        }
        else if (myExitDirection === Direction.Down) {
            theirExitDirection = Direction.Up
        }
        else if (myExitDirection === Direction.Left) {
            theirExitDirection = Direction.Right
        }
        else {
            theirExitDirection = Direction.Left
        }
        room.setRoomExit(theirExitDirection, this)
    }

    public setRoomExit(direction: Direction.Up | Direction.Down | Direction.Left | Direction.Right, room: IRoom): void {
        if (direction === Direction.Up) {
            this._roomToNorth = room
        }
        else if (direction === Direction.Right) {
            this._roomToRight = room
        }
        else if (direction === Direction.Down) {
            this._roomToSouth = room
        }
        else {
            this._roomToLeft = room
        }
        this.createWallCollisions()
        this.createDoors()
        this.createRoomTransitions()
    }

    public getDoors(): IDoor[] {
        return [this._northDoor, this._rightDoor, this._southDoor, this._leftDoor].filter(d => d)
    }

    public doorOpened(door: IDoor): void {
        if (this._northDoor === door) {
            this._northDoor = null
        }
        else if (this._leftDoor === door) {
            this._leftDoor = null
        }
        else if (this._southDoor === door) {
            this._southDoor = null
        }
        else if (this._rightDoor === door) {
            this._rightDoor = null
        }
    }

    public getRoomTransitions(): IRoomTransition[] {
        return [this._northRoomTransition, this._rightRoomTransition, this._southRoomTransition, this._leftRoomTransition].filter(rt => rt)
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        if (this._roomToNorth) {
            this._myScreen.drawStraightLine(this._location, { x: this._location.x + 0.4 * this._size.width, y: this._location.y }, Config.Rooms.WallColor)
            this._myScreen.drawStraightLine({ x: this._location.x + 0.6 * this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y }, Config.Rooms.WallColor)
        }
        else {
            this._myScreen.drawStraightLine(this._location, { x: this._location.x + this._size.width, y: this._location.y }, Config.Rooms.WallColor)
        }

        if (this._roomToRight) {
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y + 0.4 * this._size.height }, Config.Rooms.WallColor)
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y + 0.6 * this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }

        if (this._roomToSouth) {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + this._size.height }, { x: this._location.x + 0.4 * this._size.width, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
            this._myScreen.drawStraightLine({ x: this._location.x + 0.6 * this._size.width, y: this._location.y + this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }

        if (this._roomToLeft) {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y }, { x: this._location.x, y: this._location.y + 0.4 * this._size.height }, Config.Rooms.WallColor)
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 0.6 * this._size.height }, { x: this._location.x, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y }, { x: this._location.x, y: this._location.y + this._size.height }, Config.Rooms.WallColor)
        }

        if (Config.Rooms.ShowWallCollisionBoxes) {
            const isColliding = this.isColliding()
            this._walls.forEach(collisionBox => {
                this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), isColliding ? Config.Collisions.YesCollisionColor : Config.Collisions.NoCollisionColor)
            })
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(): void {
        this.draw()

        if (this._northDoor) {
            this._northDoor.update()
        }

        if (this._leftDoor) {
            this._leftDoor.update()
        }

        if (this._southDoor) {
            this._southDoor.update()
        }

        if (this._rightDoor) {
            this._rightDoor.update()
        }

        if (this._northRoomTransition) {
            this._northRoomTransition.update()
        }

        if (this._rightRoomTransition) {
            this._rightRoomTransition.update()
        }

        if (this._southRoomTransition) {
            this._southRoomTransition.update()
        }

        if (this._leftRoomTransition) {
            this._leftRoomTransition.update()
        }
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return this._walls
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
        return this._entitiesCollidingWithMe.length > 0
    }

    private createWallCollisions(): void {
        this._walls = []
        if (this._roomToNorth) {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this),
                new WallCollision({ x: this._location.x - 3 + 0.6 * this._size.width, y: this._location.y - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this)
            )
        }
        else {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: 6, width: this._size.width + 6 }, this)
            )
        }

        if (this._roomToRight) {
            this._walls.push(
                new WallCollision({ x: this._location.x + this._size.width - 3, y: this._location.y - 3 }, { height: 0.4 * this._size.height + 6, width: 6 }, this),
                new WallCollision({ x: this._location.x + this._size.width - 3, y: this._location.y - 3 + 0.6 * this._size.height }, { height: 0.4 * this._size.height + 6, width: 6 }, this)
            )
        }
        else {
            this._walls.push(
                new WallCollision({ x: this._location.x + this._size.width - 3, y: this._location.y - 3 }, { height: this._size.height + 6, width: 6 }, this)
            )
        }

        if (this._roomToSouth) {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y + this._size.height - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this),
                new WallCollision({ x: this._location.x - 3 + 0.6 * this._size.width, y: this._location.y + this._size.height - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this)
            )
        }
        else {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y + this._size.height - 3 }, { height: 6, width: this._size.width + 6 }, this)
            )
        }

        if (this._roomToLeft) {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: 0.4 * this._size.height + 6, width: 6 }, this),
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 + 0.6 * this._size.height }, { height: 0.4 * this._size.height + 6, width: 6 }, this)
            )
        }
        else {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: this._size.height + 6, width: 6 }, this)
            )
        }
    }

    private createDoors(): void {
        this._northDoor = null
        this._rightDoor = null
        this._southDoor = null
        this._leftDoor = null

        if (this._roomToNorth) {
            this._northDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Up), { height: 20, width: 0.2 * this._size.width }, this)
        }

        if (this._roomToRight) {
            this._rightDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Right), { height: 0.2 * this._size.height, width: 20 }, this)
        }

        if (this._roomToSouth) {
            this._southDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Down), { height: 20, width: 0.2 * this._size.width }, this)
        }

        if (this._roomToLeft) {
            this._leftDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Left), { height: 0.2 * this._size.height, width: 20 }, this)
        }
    }

    private createRoomTransitions(): void {
        this._northRoomTransition = null
        this._rightRoomTransition = null
        this._southRoomTransition = null
        this._leftRoomTransition = null

        if (this._roomToNorth) {
            this._northRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Up), { height: 20, width: 0.3 * this._size.width }, this._roomToNorth)
        }

        if (this._roomToRight) {
            this._rightRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Right), { height: 0.3 * this._size.height, width: 20 }, this._roomToRight)
        }

        if (this._roomToSouth) {
            this._southRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Down), { height: 20, width: 0.3 * this._size.width }, this._roomToSouth)
        }

        if (this._roomToLeft) {
            this._leftRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Left), { height: 0.3 * this._size.height, width: 20 }, this._roomToLeft)
        }
    }

    private getDoorLocation(direction: Direction.Up | Direction.Right | Direction.Down | Direction.Left): IPoint {
        if (direction === Direction.Up) {
            return { x: this._location.x + 0.4 * this._size.width, y: this._location.y - 10 }
        }

        if (direction === Direction.Right) {
            return { x: this._location.x + this._size.width - 10, y: this._location.y + 0.4 * this._size.height }
        }

        if (direction === Direction.Down) {
            return { x: this._location.x + 0.4 * this._size.width, y: this._location.y + this._size.height - 10 }
        }

        // Direction.Left
        return { x: this._location.x - 10, y: this._location.y + 0.4 * this._size.height }
    }

    private getRoomTransitionLocation(direction: Direction.Up | Direction.Right | Direction.Down | Direction.Left): IPoint {
        if (direction === Direction.Up) {
            return { x: this._location.x + 0.35 * this._size.width, y: this._location.y - 50 }
        }

        if (direction === Direction.Right) {
            return { x: this._location.x + this._size.width + 30, y: this._location.y + 0.35 * this._size.height }
        }

        if (direction === Direction.Down) {
            return { x: this._location.x + 0.35 * this._size.width, y: this._location.y + this._size.height + 30 }
        }

        // Direction.Left
        return { x: this._location.x - 50, y: this._location.y + 0.35 * this._size.height }
    }
}
