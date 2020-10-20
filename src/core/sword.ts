import { Direction, IMyScreen, IWeapon, IPlayer, WeaponState } from '.'
import { ICollidable, IHasCollisions, CircleCollision, EnemyCollision } from './collision'
import { Colors, IPoint } from '../gui'

export class Sword implements IWeapon, IHasCollisions {
    private readonly _myScreen: IMyScreen
    private _character: IPlayer

    private readonly _offset = 15
    private readonly _swordLength = 75
    private readonly _handleLength = 15
    private readonly _guardLength = 20
    private _startAngle = 90 + 22.5
    private _arcOfSwing = 90 + 45
    private _angleMoved = 0
    private readonly _attackingAngleChangeRate = 500
    private readonly _returningAngleChangeRate = 500
    private _state = WeaponState.Resting
    private _acceptingAttacks = true
    private _hitboxes: CircleCollision[] = []
    private _isColliding = false

    constructor(myScreen: IMyScreen) {
        this._myScreen = myScreen
    }

    public getState(): WeaponState {
        return this._state
    }

    draw(): void {
        const startPoint = this.getStartPoint()

        this._myScreen.drawStraightLine(startPoint, {
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, Colors.Black)

        const guardStartPoint: IPoint = {
            x: startPoint.x + this._handleLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._handleLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }

        this._myScreen.drawStraightLine({
            x: guardStartPoint.x - (this._guardLength / 2.0) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: guardStartPoint.y - (this._guardLength / 2.0) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, {
            x: guardStartPoint.x + (this._guardLength / 2.0) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: guardStartPoint.y + (this._guardLength / 2.0) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, Colors.Black)
    }

    private getStartPoint(): IPoint {
        const pLoc = this._character.getLocation()
        const pRad = this._character.getRadius()
        const direction = this._character.getMostRecentDirection()

        if (direction === Direction.Up) {
            return {
                x: pLoc.x + pRad + this._offset,
                y: pLoc.y
            }
        }

        if (direction === Direction.UpRight) {
            return {
                x: pLoc.x + (pRad + this._offset) * Math.cos(Math.PI / 4),
                y: pLoc.y + (pRad + this._offset) * Math.sin(Math.PI / 4),
            }
        }

        if (direction === Direction.Right) {
            return {
                x: pLoc.x,
                y: pLoc.y + pRad + this._offset
            }
        }

        if (direction === Direction.DownRight) {
            return {
                x: pLoc.x - (pRad + this._offset) * Math.cos(Math.PI / 4),
                y: pLoc.y + (pRad + this._offset) * Math.sin(Math.PI / 4),
            }
        }

        if (direction === Direction.Down) {
            return {
                x: pLoc.x - pRad - this._offset,
                y: pLoc.y
            }
        }

        if (direction === Direction.DownLeft) {
            return {
                x: pLoc.x - (pRad + this._offset) * Math.cos(Math.PI / 4),
                y: pLoc.y - (pRad + this._offset) * Math.sin(Math.PI / 4),
            }
        }

        if (direction === Direction.Left) {
            return {
                x: pLoc.x,
                y: pLoc.y - pRad - this._offset
            }
        }

        return {
            x: pLoc.x + (pRad + this._offset) * Math.cos(Math.PI / 4),
            y: pLoc.y - (pRad + this._offset) * Math.sin(Math.PI / 4),
        }
    }

    update(deltaTime: number) {
        if(!this._character) return

        this.updateSword(deltaTime)
        this.draw()
    }

    attack(): void {
        if (this._acceptingAttacks) {
            this._state = WeaponState.Swinging
            this._acceptingAttacks = false
        }
    }

    updateSword(deltaTime: number) {
        const characterDirection = this._character.getMostRecentDirection()
        if (characterDirection === Direction.Down) {
            this._startAngle = -90 + 22.5
        }
        else if (characterDirection === Direction.DownLeft) {
            this._startAngle = -135 + 22.5
        }
        else if (characterDirection == Direction.Left) {
            this._startAngle = 180 + 22.5
        }
        else if (characterDirection === Direction.UpLeft) {
            this._startAngle = 135 + 22.5
        }
        else if (characterDirection === Direction.Up) {
            this._startAngle = 90 + 22.5
        }
        else if (characterDirection === Direction.UpRight) {
            this._startAngle = 45 + 22.5
        }
        else if (characterDirection === Direction.Right) {
            this._startAngle = 0 + 22.5
        }
        else if (characterDirection === Direction.DownRight) {
            this._startAngle = -45 + 22.5
        }

        if (this._state === WeaponState.Swinging) {
            if (this._angleMoved >= this._arcOfSwing) {
                this._state = WeaponState.ReturnSwinging
                return
            }

            const newAngle = Math.min(this._angleMoved + this._attackingAngleChangeRate * deltaTime, this._arcOfSwing)
            this._angleMoved = newAngle
        }
        else if (this._state === WeaponState.ReturnSwinging) {
            if (this._angleMoved <= 0) {
                this._state = WeaponState.Resting
                this._acceptingAttacks = true
                return
            }

            const newAngleMoved = Math.max(this._angleMoved - this._returningAngleChangeRate * deltaTime, 0)
            this._angleMoved = newAngleMoved
        }
    }

    public attachToPlayer(player: IPlayer): void {
        player.equipWeapon(this)
        this._character = player
    }

    public detachFromPlayer(): void {
        if(this._character){
            this._character.unequipWeapon(this)
            this._character = null
        }
    }

    public getCollisionShapes(): ICollidable[] {
        return this._hitboxes
    }

    public collisionStarted(shapes: ICollidable[]): void {
        shapes
        this._isColliding = true
    }

    public collisionEnded(): void {
        this._isColliding = false
    }
}