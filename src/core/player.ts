import { Direction } from './direction.enum'
import { IControllable } from './controllable.h'
import { IHasHealth } from './hasHealth.h'
import { IMyScreen } from './myScreen.h'
import { IUpdatable } from './updatable.h'
import { IWeapon } from './weapon.h'
import { Sword } from './sword'
import { Colors } from '../gui/colors'
import { IColor } from '../gui/color.h'
import { IDrawable } from '../gui/drawable.h'
import { IPoint } from '../gui/point.h'
import { Keycode } from '../gui/keycode.enum'
import { calculateNewPosition, calculateVelocity } from '../helpers/calculationHelpers'
import { clearOldCharacter, clearOldCollision, clearOldHealthBar } from '../helpers/clearHelpers'
import { getDirection } from '../helpers/directionHelpers'
import { drawCharacter, drawCollision, drawHealthBar } from '../helpers/drawHelpers'
import { CircleCollision } from './collision/circleCollision'
import { EnemyCollision } from './collision/enemyCollision'
import { ICollidable } from './collision/collidable.h'
import { IHasCollisions } from './collision/hasCollisions.h'
import { WallCollision } from './collision/wallCollision'

export class Player implements IDrawable, IControllable, IUpdatable, IHasCollisions, IHasHealth {
    private _location: IPoint
    private _oldLocation: IPoint
    private _radius: number = 25
    private readonly _myScreen: IMyScreen
    private readonly _movementSpeed = 200
    private _collisionCircle: CircleCollision
    private _isColliding = false
    private _mainColor: IColor = Colors.Blue
    private _secondaryColor: IColor = Colors.Green
    private _noCollisionColor: IColor = Colors.Green
    private _yesCollisionColor: IColor = Colors.Red
    private _maxHealth: number = 100
    private _currentHealth: number = 100
    private _weapon: IWeapon
    private _upPressed = false
    private _rightPressed = false
    private _downPressed = false
    private _leftPressed = false
    private _direction = Direction.Up

    constructor(location: IPoint, myScreen: IMyScreen) {
        this._location = location
        this._oldLocation = location
        this._myScreen = myScreen
        this._collisionCircle = new CircleCollision(this._location, this._radius + 3)
        this._weapon = new Sword(this._myScreen, this)
    }

    public getLocation(): IPoint {
        return this._location
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
    
    public getDirection(): Direction {
        return getDirection(this._upPressed, this._rightPressed, this._downPressed, this._leftPressed)
    }

    public isMoving(): boolean {
        return this.getDirection() !== Direction.None
    }

    public clearOld(): void {
        clearOldCollision(this._myScreen, this._collisionCircle.getOldLocation(), this._collisionCircle.getRadius())
        clearOldCharacter(this._myScreen, this._oldLocation, this._radius)
        clearOldHealthBar(this._myScreen, this._oldLocation, this._radius)
        this._weapon.clearOld()
    }

    public draw(): void {
        drawCharacter(this._myScreen, this._location, this._radius, this._direction, this._mainColor, this._secondaryColor)
        drawCollision(this._myScreen, this._collisionCircle.getLocation(), this._collisionCircle.getRadius(), this._yesCollisionColor, this._noCollisionColor, this._isColliding)
        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    public keyPressed(keyCode: Keycode) {
        if(keyCode === Keycode.Up) {
            this._upPressed = true
        }
        else if(keyCode === Keycode.Right) {
            this._rightPressed = true
        }
        else if(keyCode === Keycode.Down) {
            this._downPressed = true
        }
        else if(keyCode === Keycode.Left) {
            this._leftPressed = true
        }
        else if(keyCode === Keycode.SPACE) {
            this._weapon.attack()
        }
    }

    public keyReleased(keyCode: Keycode) {
        if(keyCode === Keycode.Up) {
            this._upPressed = false
        }
        else if(keyCode === Keycode.Right) {
            this._rightPressed = false
        }
        else if(keyCode === Keycode.Down) {
            this._downPressed = false
        }
        else if(keyCode === Keycode.Left) {
            this._leftPressed = false
        }
        if(keyCode === Keycode.SPACE) {

        }
    }

    public update(deltaTime: number): void {
        this.updateDirection()
        this.calculateLocation(deltaTime)
        this._collisionCircle.setLocation(this._location)
        this.draw()
        if(this._weapon) {
            this._weapon.update(deltaTime)
        }
    }

    private updateDirection(): void {
        const newDirection = this.getDirection()
        if(newDirection !== Direction.None) {
            this._direction = newDirection
        }
    }
 
    private calculateLocation(deltaTime: number): void {
        if (!this.isMoving()) return
        // if(this._weapon && this._weapon.getState() === WeaponState.Swinging) return

        const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
        const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)

        this._oldLocation = this._location
        this._location = newLocation
    }

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionCircle]
    }

    private _lastTookDamage: number
    public collisionStarted(shapes: ICollidable[]): void {
        this._isColliding = true

        shapes.forEach(shape => {
            if (shape instanceof WallCollision) {
                this._location = this._oldLocation
            }
            else if (shape instanceof EnemyCollision) {
                if (!this._lastTookDamage || ((Date.now() - this._lastTookDamage) / 1000.0) >= .5) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                }
            }
        })
    }

    public collisionEnded(): void {
        this._isColliding = false
    }

    public getMaxHealth(): number {
        return this._maxHealth
    }

    public getCurrentHealth(): number {
        return this._currentHealth
    }

    public takeDamage(amount: number): void {
        this._currentHealth = Math.max(this._currentHealth - amount, 0)
    }
}
