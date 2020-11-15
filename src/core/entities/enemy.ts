import { Direction, IMyScreen } from '..'
import { Door, EnemyState, IEnemy, Player, Wall } from '.'
import { EnemyCollision, ICollidable } from '../collision'
import { Weapon, WeaponState } from './weapons'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar } from '../../helpers'

import { CircleCollision } from '../collision/circleCollision'
import { Config } from '../../config'
import { Entity } from './entity'
import { IPoint } from '../../gui'
import { IRoom } from './room.h'
import { IWeapon } from './weapons/weapon.h'
import { RoomState } from './roomState.enum'

export class Enemy extends Entity implements IEnemy {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number = 25
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 50
    private readonly _knockbackSpeed = 200
    private _direction = Direction.Down
    private _maxHealth = 100
    private _currentHealth = 100
    private _state = EnemyState.TargetDummy
    private _oldState = EnemyState.TargetDummy
    private _knockbackAngle: number

    private _collisionShape: EnemyCollision
    private _activationShape: CircleCollision
    private _collisionConcerns: ICollidable[] = []
    private _activationConcerns: ICollidable[] = []

    private _lastAiTick: number

    private _lastTookDamage: number
    private _room: IRoom
    private _weapon: IWeapon

    constructor(location: IPoint, myScreen: IMyScreen, initialState: EnemyState = EnemyState.Moving) {
        super()
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionShape = new EnemyCollision(location, this._radius + 3, this)
        this._activationShape = new CircleCollision(location, this._radius + 55, this)
        this._state = initialState
        this._oldState = initialState
    }

    // ----------------------------------------
    //              IEnemy
    // ----------------------------------------
    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._oldLocation = this._location
        this._location = newLocation
        this._collisionShape.setLocation(newLocation)
        this._activationShape.setLocation(newLocation)
    }

    public getOldLocation(): IPoint {
        return this._oldLocation
    }

    public setOldLocation(newOldLocation: IPoint): void {
        this._oldLocation = newOldLocation
    }

    public getDirection(): Direction {
        return this._direction
    }

    public getMostRecentDirection(): Direction {
        return this._direction
    }

    public getRadius(): number {
        return this._radius
    }

    public setRoom(newRoom: IRoom): void {
        this._room = newRoom
    }

    public equipWeapon(weapon: IWeapon): void {
        this._weapon = weapon
    }

    public unequipWeapon(weapon: IWeapon): void {
        weapon
        this._weapon = null
    }

    public getWeapon(): IWeapon {
        return this._weapon
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, Config.Enemies.MainColor, Config.Enemies.SecondaryColor)

        if (Config.Enemies.ShowCollisionBoxes) {
            if (this._state === EnemyState.KnockbackFromDamage || this._state === EnemyState.InvincibleDueToDamage) {
                drawCollision(this._myScreen, this._collisionShape.getLocation(), this._collisionShape.getRadius(), Config.Enemies.InvincibleColor, Config.Enemies.InvincibleColor, this.isColliding())
            }
            else {
                drawCollision(this._myScreen, this._collisionShape.getLocation(), this._collisionShape.getRadius(), Config.Collisions.YesCollisionColor, Config.Collisions.NoCollisionColor, this.isColliding())
            }

            drawCollision(this._myScreen, this._activationShape.getLocation(), this._activationShape.getRadius(), Config.Collisions.YesCollisionColor, Config.Collisions.NoCollisionColor, this.isWithinRangeOfTargets())
        }

        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        if (this._room.getRoomState() === RoomState.Transitioning) {
            this.draw()
            return
        }

        if(this.isCollidiingWithDamageSources()) {
            if (this._state === EnemyState.Moving || this._state === EnemyState.CollidingWithPlayer || this._state === EnemyState.TargetDummy) {
                this.takeDamage(10)
                const theirLoc = this._room.getPlayer().getLocation()
                const myLoc = this._location
                const deltaX = myLoc.x - theirLoc.x
                const deltaY = myLoc.y - theirLoc.y

                let angle = Math.atan(-deltaY / deltaX) * 180.0 / Math.PI
                if(deltaX < 0 && deltaY < 0) {
                    angle += 180
                }
                else if(deltaX < 0 && deltaY > 0) {
                    angle -= 180
                }

                this._oldState = this._state
                this._state = EnemyState.KnockbackFromDamage
                this._knockbackAngle = angle
            }
        }

        this.calculateNewLocation(deltaTime)

        if (this._weapon) {
            this._weapon.update(deltaTime)
        }

        this.draw()
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionShape]
    }

    public setCollisionEntityConcerns(shapes: ICollidable[]): void {
        this._collisionConcerns = shapes
    }

    // ----------------------------------------
    //              IHasActivations
    // ----------------------------------------

    public getActivationShapes(): ICollidable[] {
        return [this._activationShape]
    }

    public setActivationEntityConcerns(shapes: ICollidable[]): void {
        this._activationConcerns = shapes
    }

    // ----------------------------------------
    //              IHasAI
    // ----------------------------------------

    public aiTick(): void {
        if(this._lastAiTick && ((Date.now() - this._lastAiTick) / 1000.0) < 0.50) return

        this._lastAiTick = Date.now()

        if (this._state === EnemyState.KnockbackFromDamage) {
            if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= 0.25) {
                this._state = EnemyState.InvincibleDueToDamage
            }
            return
        }

        if (this._state === EnemyState.InvincibleDueToDamage) {
            if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= 0.5) {
                this._state = this._oldState
            }
            return
        }

        if(this.isWithinRangeOfTargets() && this._weapon) {
            this._weapon.attack()
        }

        const myLoc = this._location
        const pLoc = this._room.getPlayer().getLocation()
        const deltaY = pLoc.y - myLoc.y
        const deltaX = pLoc.x - myLoc.x
        let angle = Math.atan(-deltaY / deltaX) * 180 / Math.PI

        // player is down and to the right of me
        if (deltaX > 0 && deltaY > 0) {
            angle = 360 + angle
        }
        // player is up and to the right of me
        else if (deltaX > 0 && deltaY < 0) {
            // do nothing
        }
        // player is down and to the left of me
        else if (deltaX < 0 && deltaY > 0) {
            angle = 180 + angle
        }
        // player is up and to the left of me
        else if (deltaX < 0 && deltaY < 0) {
            angle = 180 + angle
        }
        else if (deltaX === 0 && deltaY > 0) {
            angle = 270
        }
        else if (deltaX === 0 && deltaY < 0) {
            angle = 90
        }
        else if (deltaY === 0 && deltaX > 0) {
            angle = 0
        }
        else if (deltaY === 0 && deltaX < 0) {
            angle = 180
        }

        if (angle < 22.5 || angle >= 337.5) {
            this._direction = Direction.Right
        }
        else if (angle >= 22.5 && angle < 67.5) {
            this._direction = Direction.UpRight
        }
        else if (angle >= 67.5 && angle < 112.5) {
            this._direction = Direction.Up
        }
        else if (angle >= 112.5 && angle < 157.5) {
            this._direction = Direction.UpLeft
        }
        else if (angle >= 157.5 && angle < 202.5) {
            this._direction = Direction.Left
        }
        else if (angle >= 202.5 && angle < 247.5) {
            this._direction = Direction.DownLeft
        }
        else if (angle >= 247.5 && angle < 292.5) {
            this._direction = Direction.Down
        }
        else if (angle >= 292.5 && angle < 337.5) {
            this._direction = Direction.DownRight
        }

        if (this._state !== EnemyState.TargetDummy) {
            if (Math.pow(deltaY, 2) + Math.pow(deltaX, 2) < Math.pow(this._radius + this._room.getPlayer().getRadius(), 2)) {
                this._state = EnemyState.CollidingWithPlayer
            }
            else {
                this._state = EnemyState.Moving
            }
        }
    }

    // ----------------------------------------
    //              IHasHealth
    // ----------------------------------------

    public getMaxHealth(): number {
        return this._maxHealth
    }

    public getCurrentHealth(): number {
        return this._currentHealth
    }

    public takeDamage(amount: number): void {
        this._currentHealth = Math.max(this._currentHealth - amount, 0)
        this._lastTookDamage = Date.now()
        if (this._currentHealth <= 0) {
            const event = new CustomEvent('onEnemyDeath', {
                detail: this
            })
            const eventTarget = document.getElementById('eventTarget')
            eventTarget.dispatchEvent(event)
        }
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private calculateNewLocation(deltaTime: number): void {
        if (this._state === EnemyState.Moving) {
            const possibleLocations = this.calculatePossibleNewLocations(deltaTime)
            this.setLocation(this.getFurthestPossibleLocation(possibleLocations))
        }
        else if (this._state === EnemyState.KnockbackFromDamage) {
            const possibleLocations = this.calculatePossibleNewLocations(deltaTime)
            this.setLocation(this.getFurthestPossibleLocation(possibleLocations))
        }
    }

    private calculatePossibleNewLocations(deltaTime: number): IPoint[] {
        if (this._state === EnemyState.Moving) {
            const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
            return [
                calculateNewPosition(this._location, newVelocity, 0.125 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.25 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.375 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.5 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.625 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.75 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.875 * deltaTime),
                calculateNewPosition(this._location, newVelocity, deltaTime)
            ]
        }
        else if (this._state === EnemyState.KnockbackFromDamage) {
            const newVelocity: IPoint = {
                x: this._knockbackSpeed * Math.cos(this._knockbackAngle * Math.PI / 180.0),
                y: -this._knockbackSpeed * Math.sin(this._knockbackAngle * Math.PI / 180.0)
            }
            return [
                calculateNewPosition(this._location, newVelocity, 0.125 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.25 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.375 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.5 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.625 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.75 * deltaTime),
                calculateNewPosition(this._location, newVelocity, 0.875 * deltaTime),
                calculateNewPosition(this._location, newVelocity, deltaTime)
            ]
        }
        return []
    }

    private getFurthestPossibleLocation(possibleLocations: IPoint[]): IPoint {
        const oldLocation = this.getLocation()
        let furthestPossibleIndex = -1

        for(let i = 0; i < possibleLocations.length; i++) {
            this.setLocation(possibleLocations[i])
            if(this.isCollidiingWithSolids()) break
            furthestPossibleIndex = i
        }

        return furthestPossibleIndex === -1 ? oldLocation : possibleLocations[furthestPossibleIndex]
    }

    private isCollidiingWithSolids(): boolean {
        const solids = this._collisionConcerns.filter(c => 
            c.getEntity() instanceof Player ||
            c.getEntity() instanceof Wall ||
            c.getEntity() instanceof Door ||
            (c.getEntity() instanceof Enemy && c.getEntity() as Enemy !== this)
        )
        for(let i = 0; i < solids.length; i++) {
            if(solids[i].isCollidingWithShapes(this.getCollisionShapes()).length > 0) return true
        }
        return false
    }

    private isCollidiingWithDamageSources(): boolean {
        const damageSources = this._collisionConcerns.filter(c => {
            if(!(c.getEntity() instanceof Weapon)) return false
            const weapon = c.getEntity() as Weapon
            return weapon.getState() === WeaponState.Swinging || weapon.getState() === WeaponState.ReturnSwinging
        })
        for(let i = 0; i < damageSources.length; i++) {
            if(damageSources[i].isCollidingWithShapes(this.getCollisionShapes()).length > 0) return true
        }
        return false
    }

    private isColliding(): boolean {
        for(let i = 0; i < this._collisionConcerns.length; i++) {
            if(this._collisionConcerns[i].isCollidingWithShapes(this.getCollisionShapes()).length > 0) return true
        }
        return false
    }

    private isWithinRangeOfTargets(): boolean {
        for(let i = 0; i < this._activationConcerns.length; i++) {
            if(this._activationConcerns[i].isCollidingWithShapes(this.getActivationShapes()).length > 0) return true
        }
        return false
    }
}
