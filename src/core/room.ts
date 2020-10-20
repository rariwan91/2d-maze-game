import { IMyScreen, IRoom, IUpdatable } from '.'
import { Colors, IDrawable, IPoint, ISize } from '../gui'
import { ICollidable, IHasCollisions, WallCollision } from './collision'

export class Room implements IDrawable, IRoom, IUpdatable, IHasCollisions {
    private _location: IPoint = { x: 20, y: 20 }
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private readonly _collisionBoxes: WallCollision[] = []
    private _isColliding = false
    private _mainColor = Colors.Black
    private _noCollisionsColor = Colors.Green
    private _yesCollisionsColor = Colors.Red

    constructor(myScreen: IMyScreen) {
        this._myScreen = myScreen
        this._size = {
            width: myScreen.getSize().width - 40,
            height: myScreen.getSize().height - 40
        }
        this._collisionBoxes.push(
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y - 3
            }, {
                height: 6,
                width: this._size.width + 6
            }),
            new WallCollision({
                x: this._location.x + this._size.width - 3,
                y: this._location.y - 3
            }, {
                height: this._size.height + 6,
                width: 6
            }),
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y + this._size.height - 3
            }, {
                height: 6,
                width: this._size.width + 6
            }),
            new WallCollision({
                x: this._location.x - 3,
                y: this._location.y - 3
            }, {
                height: this._size.height + 6,
                width: 6
            })
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

    public draw(): void {
        this._myScreen.drawRect(this.getLocation(), this.getSize(), this._mainColor)

        // draw collision boxes
        if (this._isColliding) {
            this._collisionBoxes.forEach(collisionBox => {
                this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), this._yesCollisionsColor)
            })
        }
        else {
            this._collisionBoxes.forEach(collisionBox => {
                this._myScreen.drawRect(collisionBox.getLocation(), collisionBox.getSize(), this._noCollisionsColor)
            })
        }
    }

    public update(): void {
        this.draw()
    }

    public getCollisionShapes(): ICollidable[] {
        return this._collisionBoxes
    }

    public collisionStarted(shapes: ICollidable[]): void {
        shapes
        this._isColliding = true
    }

    public collisionEnded(): void {
        this._isColliding = false
    }
}
