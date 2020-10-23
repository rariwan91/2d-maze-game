import { Direction, IMyScreen } from '../'
import { IRoom } from '.'
import { Entity } from './entity'
import { Colors, IPoint, ISize, Keycode } from '../../gui'
import { CollisionConfig, DoorCollision, ICollidable, WallCollision } from './../collision'

export class Room extends Entity implements IRoom {
    private _location: IPoint = { x: 50, y: 50 }
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private _walls: WallCollision[] = []
    private _doors: DoorCollision[] = []
    private _mainColor = Colors.Black
    private _noCollisionsColor = Colors.Green
    private _yesCollisionsColor = Colors.Red
    private _entitiesCollidingWithMe: Entity[] = []
    private _roomToNorth: IRoom
    private _roomToRight: IRoom
    private _roomToSouth: IRoom
    private _roomToLeft: IRoom

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
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        if (this._roomToNorth) {
            this._myScreen.drawStraightLine(this._location, { x: this._location.x + 0.4 * this._size.width, y: this._location.y }, this._mainColor)
            this._myScreen.drawRect({ x: this._location.x + 0.4 * this._size.width, y: this._location.y - 10 }, { width: 0.2 * this._size.width, height: 20 }, Colors.Brown, Colors.Brown)
            this._myScreen.drawStraightLine({ x: this._location.x + 0.6 * this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y }, this._mainColor)
        }
        else {
            this._myScreen.drawStraightLine(this._location, { x: this._location.x + this._size.width, y: this._location.y }, this._mainColor)
        }

        if (this._roomToRight) {
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y + 0.4 * this._size.height }, this._mainColor)
            this._myScreen.drawRect({ x: this._location.x - 10 + this._size.width, y: this._location.y + 0.4 * this._size.height }, { width: 20, height: 0.2 * this._size.height }, Colors.Brown, Colors.Brown)
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y + 0.6 * this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, this._mainColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x + this._size.width, y: this._location.y }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, this._mainColor)
        }

        if (this._roomToSouth) {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + this._size.height }, { x: this._location.x + 0.4 * this._size.width, y: this._location.y + this._size.height }, this._mainColor)
            this._myScreen.drawRect({ x: this._location.x + 0.4 * this._size.width, y: this._location.y + this._size.height - 10 }, { width: 0.2 * this._size.width, height: 20 }, Colors.Brown, Colors.Brown)
            this._myScreen.drawStraightLine({ x: this._location.x + 0.6 * this._size.width, y: this._location.y + this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, this._mainColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + this._size.height }, { x: this._location.x + this._size.width, y: this._location.y + this._size.height }, this._mainColor)
        }

        if (this._roomToLeft) {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y }, { x: this._location.x, y: this._location.y + 0.4 * this._size.height }, this._mainColor)
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + 0.4 * this._size.height }, { width: 20, height: 0.2 * this._size.height }, Colors.Brown, Colors.Brown)
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + 0.6 * this._size.height }, { x: this._location.x, y: this._location.y + this._size.height }, this._mainColor)
        }
        else {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y }, { x: this._location.x, y: this._location.y + this._size.height }, this._mainColor)
        }

        if (CollisionConfig) {
            const isColliding = this.isColliding()
            if (CollisionConfig.Rooms.ShowWallCollisionBoxes) {
                this._walls.forEach(collisionBox => {
                    this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), isColliding ? this._yesCollisionsColor : this._noCollisionsColor)
                })
            }
            if (CollisionConfig.Rooms.ShowDoorCollisionBoxes) {
                this._doors.forEach(collisionBox => {
                    this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), isColliding ? this._yesCollisionsColor : this._noCollisionsColor)
                })
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
        return this._walls.concat(this._doors)
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []

        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this._walls.concat(this._doors))
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
    //              IRespondsToInput
    // ----------------------------------------

    public keyPressed(keyCode: Keycode) {
        if (keyCode === Keycode.ENTER) {
            console.log('player pressed enter and the door saw it')
        }
    }

    public keyReleased(keyCode: Keycode) {
        if (keyCode === Keycode.ENTER) {

        }
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    private createWallCollisions(): void {
        this._walls = []
        this._doors = []
        if (this._roomToNorth) {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this),
                new WallCollision({ x: this._location.x - 3 + 0.6 * this._size.width, y: this._location.y - 3 }, { height: 6, width: 0.4 * this._size.width + 6 }, this)
            )
            this._doors.push(
                new DoorCollision({ x: this._location.x - 3 + 0.4 * this._size.width, y: this._location.y - 10 - 3 }, { height: 26, width: 0.2 * this._size.width + 6 }, this)
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
            this._doors.push(
                new DoorCollision({ x: this._location.x + this._size.width - 10 - 3, y: this._location.y + 0.4 * this._size.height - 3 }, { height: 0.2 * this._size.height + 6, width: 26 }, this)
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
            this._doors.push(
                new DoorCollision({ x: this._location.x - 3 + 0.4 * this._size.width, y: this._location.y + this._size.height - 10 - 3 }, { height: 26, width: 0.2 * this._size.width + 6 }, this)
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
            this._doors.push(
                new DoorCollision({ x: this._location.x - 10 - 3, y: this._location.y + 0.4 * this._size.height - 3 }, { height: 0.2 * this._size.height + 6, width: 26 }, this)
            )
        }
        else {
            this._walls.push(
                new WallCollision({ x: this._location.x - 3, y: this._location.y - 3 }, { height: this._size.height + 6, width: 6 }, this)
            )
        }
    }
}
