import { Colors, IPoint } from '../../../gui'
import { Direction, IMyScreen } from '../..'
import { Weapon, WeaponState } from '.'

import { CircleCollision } from '../../collision/circleCollision'
import { Config } from '../../../config'
import { Entity } from '../entity'
import { ICollidable } from '../../collision'
import { IEnemy } from '../enemy.h'

export class Claw extends Weapon {
    private readonly _myScreen: IMyScreen
    private _enemy: IEnemy

    private readonly _offset = 25
    private readonly _clawRadius = 15
    private _startAngle = 0
    private _arcOfSwing = 90
    private _angleMoved = 0
    private readonly _attackingAngleChangeRate = 600
    private readonly _returningAngleChangeRate = 600
    private _state = WeaponState.Resting
    private _acceptingAttacks = true
    private _hitbox: CircleCollision
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
        this.initializeClawHitbox()
    }

    public detachFromCharacter(): void {
        if (this._enemy) {
            this._enemy.unequipWeapon(this)
            this._enemy = null
            this._hitbox = null
        }
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        const startPoint = this.getFistLocation()

        // Draw fist
        this._myScreen.drawArc(startPoint, this._clawRadius, 0, 360, Colors.Black, Config.Enemies.MainColor)

        if (Config.Weapons.ShowCollisionBoxes) {
            if (this.isColliding()) {
                this._myScreen.drawArc(this._hitbox.getLocation(), this._hitbox.getRadius(), 0, 360, Config.Collisions.YesCollisionColor)
            }
            else {
                this._myScreen.drawArc(this._hitbox.getLocation(), this._hitbox.getRadius(), 0, 360, Config.Collisions.NoCollisionColor)
            }
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        if (!this._enemy) return

        this.updateClaw(deltaTime)
        this.draw()
    }

    // ----------------------------------------
    //              IHasCollision
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._hitbox]
    }

    public checkForCollisionsWith(collidables: ICollidable[]): void {
        const entities: Entity[] = []

        collidables.forEach(collidable => {
            const result = collidable.isCollidingWithShapes(this.getCollisionShapes())
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

    private updateClaw(deltaTime: number): void {
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

        this.updateClawHitbox()
    }

    private getFistLocation(): IPoint {
        const enemyLocation = this._enemy.getLocation()
        const enemyDirection = this._enemy.getMostRecentDirection()
        const enemyRadius = this._enemy.getRadius()
        const armLength = enemyRadius + this._offset
        const totalAngle = this._startAngle + this._angleMoved

        if (enemyDirection === Direction.Up) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.UpRight) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.Right) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.DownRight) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.Down) {
            return {
                x: enemyLocation.x + armLength * Math.cos((totalAngle) * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.DownLeft) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        if (enemyDirection === Direction.Left) {
            return {
                x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
                y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
            }
        }

        // Direction.UpLeft
        return {
            x: enemyLocation.x + armLength * Math.cos(totalAngle * Math.PI / 180),
            y: enemyLocation.y - armLength * Math.sin(totalAngle * Math.PI / 180)
        }
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    private setStartAngle(): void {
        const characterDirection = this._enemy.getMostRecentDirection()
        if (characterDirection === Direction.Down) {
            this._startAngle = -135
        }
        else if (characterDirection === Direction.DownLeft) {
            this._startAngle = -180
        }
        else if (characterDirection == Direction.Left) {
            this._startAngle = 135
        }
        else if (characterDirection === Direction.UpLeft) {
            this._startAngle = 90
        }
        else if (characterDirection === Direction.Up) {
            this._startAngle = 45
        }
        else if (characterDirection === Direction.UpRight) {
            this._startAngle = 0
        }
        else if (characterDirection === Direction.Right) {
            this._startAngle = -45
        }
        else if (characterDirection === Direction.DownRight) {
            this._startAngle = -90
        }
    }

    private initializeClawHitbox(): void {
        const startPoint = this.getFistLocation()
        this._hitbox = new CircleCollision(startPoint, this._clawRadius + 3, this)
    }

    private updateClawHitbox(): void {
        const startPoint = this.getFistLocation()
        this._hitbox.setLocation(startPoint)
    }
}