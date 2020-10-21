import { IMyScreen, IRoom, IUpdatable } from '.'
import { Colors, IDrawable, IPoint, ISize } from '../gui'
import { ICollidable, IHasCollisions, WallCollision } from './collision'
import { Entity } from './entity'

export class Room extends Entity implements IDrawable, IRoom, IUpdatable, IHasCollisions {
    private _location: IPoint = { x: 20, y: 20 }
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private readonly _walls: WallCollision[] = []
    private _mainColor = Colors.Black
    private _noCollisionsColor = Colors.Green
    private _yesCollisionsColor = Colors.Red
    private _entitiesCollidingWithMe: Entity[] = []

    constructor(myScreen: IMyScreen) {
        super()
        this._myScreen = myScreen
        this._size = {
            width: myScreen.getSize().width - 40,
            height: myScreen.getSize().height - 40
        }
        this._walls.push(
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y - 3
            }, {
                height: 6,
                width: this._size.width + 6
            }, this),
            new WallCollision({
                x: this._location.x + this._size.width - 3,
                y: this._location.y - 3
            }, {
                height: this._size.height + 6,
                width: 6
            }, this),
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y + this._size.height - 3
            }, {
                height: 6,
                width: this._size.width + 6
            }, this),
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y - 3
            }, {
                height: this._size.height + 6,
                width: 6
            }, this)
        )
    }

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(location: IPoint) {
        this._location = location
    }

    public getSize(): ISize {
        return this._size
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    public draw(): void {
        this._myScreen.drawRect(this.getLocation(), this.getSize(), this._mainColor)

        // draw collision boxes
        if (this.isColliding()) {
            this._walls.forEach(collisionBox => {
                this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), this._yesCollisionsColor)
            })
        }
        else {
            this._walls.forEach(collisionBox => {
                this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), this._noCollisionsColor)
            })
        }
    }

    public update(): void {
        this.draw()
    }

    public getCollisionShapes(): ICollidable[] {
        return this._walls
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []

        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this._walls)
            if(!result || result.length > 0) {
                const entity = collidable.getEntity()
                if(!entities.includes(entity)) {
                    entities.push(entity)
                }
            }
        })

        this._entitiesCollidingWithMe = entities
    }

    public getEntity(): Entity {
        return this
    }
}
