import { Direction, IMyScreen } from '..'
import { Door, Enemy, IPlayer, PlayerState, Wall } from '.'
import { IPoint, Keycode } from '../../gui'
import { IWeapon, Weapon, WeaponState } from './weapons'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar, getDirection } from '../../helpers'

import { CircleCollision } from '../collision/circleCollision'
import { Config } from '../../config'
import { Entity } from './entity'
import { ICollidable } from '../collision'

export class Player extends Entity implements IPlayer {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius = 25
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 200
    private _collisionCircle: CircleCollision
    private _maxHealth = 100
    private _currentHealth = 100
    private _weapon: IWeapon
    private _upPressed = false
    private _rightPressed = false
    private _downPressed = false
    private _leftPressed = false
    private _direction = Direction.Up
    private _state = PlayerState.Normal
    private _entitiesCollidingWithMe: Entity[] = []
    private _lastTookDamage: number

    constructor(location: IPoint, myScreen: IMyScreen) {
        super()
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(this._location, this._radius + 3, this)
    }

    // ----------------------------------------
    //              IPlayer
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        this._location = newLocation
        this._collisionCircle.setLocation(newLocation)
    }

    public getOldLocation(): IPoint {
        return this._oldLocation
    }

    public getRadius(): number {
        return this._radius
    }

    public getMostRecentDirection(): Direction {
        return this._direction
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
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionCircle]
    }

    public setCollisionEntityConcerns(shapes: ICollidable[]): void {
        const collidingShapes = this._collisionCircle.isCollidingWithShapes(shapes)
        const collidingEntities: Entity[] = []
        collidingShapes.forEach(collidable => {
            const entity = collidable.getEntity()
            if (!collidingEntities.includes(entity)) {
                collidingEntities.push(entity)
            }
        })
        this._entitiesCollidingWithMe = collidingEntities
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Wall || entity instanceof Door) {
                this.setLocation(this._oldLocation)
            }
            else if (entity instanceof Enemy) {
                if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                    this._state = PlayerState.InvincibleDueToDamage
                }
            }
            else if (entity instanceof Weapon) {
                if (entity.getState() === WeaponState.Swinging || entity.getState() === WeaponState.ReturnSwinging) {
                    if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
                        this.takeDamage(10)
                        this._lastTookDamage = Date.now()
                        this._state = PlayerState.InvincibleDueToDamage
                    }
                }
            }
        })

        if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
            this._state = PlayerState.Normal
        }

        this.updateDirection()
        this.calculateLocation(deltaTime)
        this._collisionCircle.setLocation(this._location)
        if (this._weapon) {
            this._weapon.update(deltaTime)
        }
        this.draw()
    }

    // ----------------------------------------
    //              IRespondsToInput
    // ----------------------------------------

    public keyPressed(keyCode: Keycode): void {
        if (keyCode === Keycode.Up) {
            this._upPressed = true
        }
        else if (keyCode === Keycode.Right) {
            this._rightPressed = true
        }
        else if (keyCode === Keycode.Down) {
            this._downPressed = true
        }
        else if (keyCode === Keycode.Left) {
            this._leftPressed = true
        }
        else if (keyCode === Keycode.SPACE) {
            if (this._weapon) {
                this._weapon.attack()
            }
        }
    }

    public keyReleased(keyCode: Keycode): void {
        if (keyCode === Keycode.Up) {
            this._upPressed = false
        }
        else if (keyCode === Keycode.Right) {
            this._rightPressed = false
        }
        else if (keyCode === Keycode.Down) {
            this._downPressed = false
        }
        else if (keyCode === Keycode.Left) {
            this._leftPressed = false
        }
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, Config.Players.MainColor, Config.Players.SecondaryColor)

        if (Config.Players.ShowCollisionBoxes) {
            if (this._state === PlayerState.InvincibleDueToDamage) {
                drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), Config.Players.InvincibleColor, Config.Players.InvincibleColor, this.isColliding())
            }
            else {
                drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), Config.Collisions.YesCollisionColor, Config.Collisions.NoCollisionColor, this.isColliding())
            }
        }

        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
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
        if (this._currentHealth <= 0) {
            const event = new CustomEvent('onPlayerDeath', {
                detail: this
            })
            const eventTarget = document.getElementById('eventTarget')
            eventTarget.dispatchEvent(event)
        }
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private getDirection(): Direction {
        return getDirection(this._upPressed, this._rightPressed, this._downPressed, this._leftPressed)
    }

    private updateDirection(): void {
        const newDirection = this.getDirection()
        if (newDirection !== Direction.None) {
            this._direction = newDirection
        }
    }

    private calculateLocation(deltaTime: number): void {
        if (this.getDirection() === Direction.None) return

        const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
        const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)
        this._oldLocation = this._location
        this._location = newLocation
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }
}
