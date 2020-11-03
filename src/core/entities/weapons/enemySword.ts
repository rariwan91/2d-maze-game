import { Weapon, WeaponState } from '.'
import { Direction, IMyScreen } from '../..'
import { Config } from '../../../config'
import { IPoint } from '../../../gui'
import { calculateSwordStartPoint } from '../../../helpers/calculationHelpers'
import { ICollidable } from '../../collision'
import { CircleCollision } from '../../collision/circleCollision'
import { IEnemy } from '../enemy.h'
import { Entity } from '../entity'

export class EnemySword extends Weapon {
    private readonly _myScreen: IMyScreen
    private _enemy: IEnemy

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
    private _hitboxes: CircleCollision[] = []
    private _entitiesCollidingWithMe: Entity[] = []

    constructor(myScreen: IMyScreen) {
        super()
        this._myScreen = myScreen
    }

    // ----------------------------------------
    //              IWeapon
    // ----------------------------------------

    public attack(): void {
        if (this._acceptingAttacks) {
            this._state = WeaponState.Swinging
            this._acceptingAttacks = false
        }
    }

    public getState(): WeaponState {
        return this._state
    }

    public attachToCharacter(character: IEnemy): void {
        character.equipWeapon(this)
        this._enemy = character
        this.initializeSwordHitboxes()
    }

    public detachFromCharacter(): void {
        if (this._enemy) {
            this._enemy.unequipWeapon(this)
            this._enemy = null
            this._hitboxes = []
        }
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        const startPoint = this.getStartPoint()

        // Draw sword line
        this._myScreen.drawStraightLine(startPoint, {
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, Config.Weapons.Color)

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
        }, Config.Weapons.Color)

        if (Config.Weapons.ShowCollisionBoxes) {
            this._hitboxes.forEach(hitbox => {
                if (this.isColliding()) {
                    this._myScreen.drawArc(hitbox.getLocation(), hitbox.getRadius(), 0, 360, Config.Collisions.YesCollisionColor)
                }
                else {
                    this._myScreen.drawArc(hitbox.getLocation(), hitbox.getRadius(), 0, 360, Config.Collisions.NoCollisionColor)
                }
            })
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        if (!this._enemy) return

        this.updateSword(deltaTime)
        this.draw()
    }

    // ----------------------------------------
    //              IHasCollision
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return this._hitboxes
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []

        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this._hitboxes)
            if (!result || result.length > 0) {
                const entity = collidable.getEntity()
                if (!entities.includes(entity)) {
                    entities.push(entity)
                }
            }
        })

        this._entitiesCollidingWithMe = entities
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private updateSword(deltaTime: number): void {
        this.setStartAngle()

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

        this.updateSwordHitboxes()
    }

    private getStartPoint(): IPoint {
        return calculateSwordStartPoint(this._enemy.getLocation(), this._enemy.getMostRecentDirection(), this._enemy.getRadius(), this._offset, this._secondOffset)
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    private setStartAngle(): void {
        const characterDirection = this._enemy.getMostRecentDirection()
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
    }

    private initializeSwordHitboxes(): void {
        const startPoint = this.getStartPoint()
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + this._swordLength * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - this._swordLength * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + (this._swordLength - 10) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 10) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + (this._swordLength - 20) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 20) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + (this._swordLength - 30) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 30) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + (this._swordLength - 40) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 40) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
        this._hitboxes.push(new CircleCollision({
            x: startPoint.x + (this._swordLength - 50) * Math.cos((this._startAngle - this._angleMoved) * Math.PI / 180.0),
            y: startPoint.y - (this._swordLength - 50) * Math.sin((this._startAngle - this._angleMoved) * Math.PI / 180.0)
        }, 10, this))
    }

    private updateSwordHitboxes(): void {
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
}