import { Direction, IMyScreen, IPlayer, WeaponState } from '.'
import { Colors, IColor, IPoint } from '../gui'
import { CollisionConfig, ICollidable, PlayerWeaponCollision } from './collision'
import { Entity } from './entity'
import { Weapon } from './weapon'

export class Sword extends Weapon {
    private readonly _myScreen: IMyScreen
    private _character: IPlayer

    private readonly _offset = 15
    private readonly _secondOffset = 30
    private readonly _swordLength = 75
    private readonly _handleLength = 15
    private readonly _guardLength = 20
    private _startAngle = 90 + 22.5
    private _arcOfSwing = 90 + 45
    private _angleMoved = 0
    private readonly _attackingAngleChangeRate = 700
    private readonly _returningAngleChangeRate = 700
    private _state = WeaponState.Resting
    private _acceptingAttacks = true
    private _hitboxes: PlayerWeaponCollision[] = []
    private _noCollisionColor: IColor = Colors.Green
    private _yesCollisionColor: IColor = Colors.Red
    private _entitiesCollidingWithMe: Entity[] = []

    constructor(myScreen: IMyScreen) {
        super()
        this._myScreen = myScreen
    }

    public getState(): WeaponState {
        return this._state
    }

    draw(): void {
        const startPoint = this.getStartPoint()

        // Draw sword line
        this._myScreen.drawStraightLine(startPoint, {
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, Colors.Black)

        const guardStartPoint: IPoint = {
            x: startPoint.x + this._handleLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._handleLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }

        // Draw sword guard line
        this._myScreen.drawStraightLine({
            x: guardStartPoint.x - (this._guardLength / 2.0) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: guardStartPoint.y - (this._guardLength / 2.0) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, {
            x: guardStartPoint.x + (this._guardLength / 2.0) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: guardStartPoint.y + (this._guardLength / 2.0) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, Colors.Black)

        if(CollisionConfig && CollisionConfig.Weapons.ShowCollisionBoxes) {
            this._hitboxes.forEach(hitbox => {
                if (this.isColliding()) {
                    this._myScreen.drawArc(hitbox.getLocation(), hitbox.getRadius(), 0, 360, this._yesCollisionColor)
                }
                else {
                    this._myScreen.drawArc(hitbox.getLocation(), hitbox.getRadius(), 0, 360, this._noCollisionColor)
                }
            })
        }
    }

    private getStartPoint(): IPoint {
        const pLoc = this._character.getLocation()
        const pRad = this._character.getRadius()
        const direction = this._character.getMostRecentDirection()

        if (direction === Direction.Up) {
            return {
                x: pLoc.x + (pRad + this._offset) * Math.cos(Math.PI / 4),
                y: pLoc.y - (pRad + this._offset) * Math.sin(Math.PI / 4) - this._secondOffset,
            }
        }

        if (direction === Direction.UpRight) {
            return {
                x: pLoc.x + pRad + this._offset + this._secondOffset * Math.cos(Math.PI / 4),
                y: pLoc.y - this._secondOffset * Math.sin(Math.PI / 4)
            }
        }

        if (direction === Direction.Right) {
            return {
                x: pLoc.x + (pRad + this._offset) * Math.cos(Math.PI / 4) + this._secondOffset,
                y: pLoc.y + (pRad + this._offset) * Math.sin(Math.PI / 4),
            }
        }

        if (direction === Direction.DownRight) {
            return {
                x: pLoc.x + this._secondOffset * Math.cos(Math.PI / 4),
                y: pLoc.y + pRad + this._offset + this._secondOffset * Math.sin(Math.PI / 4)
            }
        }

        if (direction === Direction.Down) {
            return {
                x: pLoc.x - (pRad + this._offset) * Math.cos(Math.PI / 4),
                y: pLoc.y + (pRad + this._offset) * Math.sin(Math.PI / 4) + this._secondOffset,
            }
        }

        if (direction === Direction.DownLeft) {
            return {
                x: pLoc.x - pRad - this._offset - this._secondOffset * Math.cos(Math.PI / 4),
                y: pLoc.y + this._secondOffset * Math.sin(Math.PI / 4)
            }
        }

        if (direction === Direction.Left) {
            return {
                x: pLoc.x - (pRad + this._offset) * Math.cos(Math.PI / 4) - this._secondOffset,
                y: pLoc.y - (pRad + this._offset) * Math.sin(Math.PI / 4),
            }
        }

        // Direction.UpLeft
        return {
            x: pLoc.x  - this._secondOffset * Math.cos(Math.PI / 4),
            y: pLoc.y - pRad - this._offset - this._secondOffset * Math.sin(Math.PI / 4)
        }
    }

    update(deltaTime: number) {
        if (!this._character) return

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
            this._startAngle = -90 + 90
        }
        else if (characterDirection === Direction.DownLeft) {
            this._startAngle = -135 + 90
        }
        else if (characterDirection == Direction.Left) {
            this._startAngle = 180 + 90
        }
        else if (characterDirection === Direction.UpLeft) {
            this._startAngle = 135 + 90
        }
        else if (characterDirection === Direction.Up) {
            this._startAngle = 90 + 90
        }
        else if (characterDirection === Direction.UpRight) {
            this._startAngle = 45 + 90
        }
        else if (characterDirection === Direction.Right) {
            this._startAngle = 0 + 90
        }
        else if (characterDirection === Direction.DownRight) {
            this._startAngle = -45 + 90
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

        const startPoint = this.getStartPoint()
        this._hitboxes[0].setLocation({
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
        this._hitboxes[1].setLocation({
            x: startPoint.x + (this._swordLength - 10) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 10) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
        this._hitboxes[2].setLocation({
            x: startPoint.x + (this._swordLength - 20) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 20) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
        this._hitboxes[3].setLocation({
            x: startPoint.x + (this._swordLength - 30) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 30) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
        this._hitboxes[4].setLocation({
            x: startPoint.x + (this._swordLength - 40) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 40) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
        this._hitboxes[5].setLocation({
            x: startPoint.x + (this._swordLength - 50) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 50) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        })
    }

    public attachToPlayer(player: IPlayer): void {
        player.equipWeapon(this)
        this._character = player
        const startPoint = this.getStartPoint()
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + (this._swordLength - 10) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 10) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + (this._swordLength - 20) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 20) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + (this._swordLength - 30) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 30) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + (this._swordLength - 40) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 40) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new PlayerWeaponCollision({
            x: startPoint.x + (this._swordLength - 50) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 50) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
    }

    public detachFromPlayer(): void {
        if (this._character) {
            this._character.unequipWeapon(this)
            this._character = null
            this._hitboxes = []
        }
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    public getCollisionShapes(): ICollidable[] {
        return this._hitboxes
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []

        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this._hitboxes)
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