import { Door, EnemyState, IEnemy, Player, Room } from '.'
import { Direction, IMyScreen } from '../'
import { Config } from '../../config'
import { IPoint } from '../../gui'
import { calculateNewPosition, calculateVelocity, drawCharacter, drawCollision, drawHealthBar, getMagnitude } from '../../helpers'
import { EnemyCollision, ICollidable } from '../collision'
import { CircleCollision } from '../collision/circleCollision'
import { Entity } from './entity'
import { IRoom } from './room.h'
import { RoomState } from './roomState.enum'
import { Weapon, WeaponState } from './weapons'
import { IWeapon } from './weapons/weapon.h'

export class Enemy extends Entity implements IEnemy {
    private _location: IPoint
    private _oldLocation: IPoint
    private readonly _radius: number = 25
    private _direction = Direction.Down
    private readonly _myScreen: IMyScreen
    private _collisionShape: EnemyCollision
    private _activationShape: CircleCollision
    private readonly _movementSpeed = 50
    private readonly _knockbackSpeed = 200
    private _maxHealth = 100
    private _currentHealth = 100
    private _state = EnemyState.TargetDummy
    private _oldState = EnemyState.TargetDummy
    private _knockbackAngle: number
    private _entitiesCollidingWithMe: Entity[] = []
    private _entitiesActivatingMe: Entity[] = []
    private _shapesCollidingWithMe: ICollidable[] = []
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
            drawCollision(this._myScreen, this._activationShape.getLocation(), this._activationShape.getRadius(), Config.Collisions.YesCollisionColor, Config.Collisions.NoCollisionColor, this.isActivating())
        }

        drawHealthBar(this._myScreen, this._location, this._radius, this._maxHealth, this._currentHealth)
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        if(this._room.getRoomState() === RoomState.Transitioning) {
            this.draw()
            return
        }

        const enemiesCollidingWithMe: Enemy[] = []
        this._entitiesCollidingWithMe.forEach(entity => {
            if (entity instanceof Room || entity instanceof Door) {
                this._location = this._oldLocation
            }
            else if (entity instanceof Weapon) {
                if ((entity.getState() === WeaponState.Swinging || entity.getState() === WeaponState.ReturnSwinging) && (this._state === EnemyState.Moving || this._state === EnemyState.CollidingWithPlayer || this._state === EnemyState.TargetDummy)) {
                    this.takeDamage(10)
                    this._lastTookDamage = Date.now()
                    const theirLoc = this._room.getPlayer().getLocation()
                    const myLoc = this._location
                    const deltaX = myLoc.x - theirLoc.x
                    const deltaY = myLoc.y - theirLoc.y

                    let angle = Math.atan(-deltaY / deltaX) * 180.0 / Math.PI
                    if (deltaX < 0 && deltaY < 0) {
                        angle = 180 + angle
                    }
                    else if (deltaX < 0 && deltaY > 0) {
                        angle = angle - 180
                    }

                    this._oldState = this._state
                    this._state = EnemyState.KnockbackFromDamage
                    this._knockbackAngle = angle
                }
            }
            else if (entity instanceof Enemy && entity !== this as Entity) {
                enemiesCollidingWithMe.push(entity)
            }
            else if (entity instanceof Player) {
                this._location = this._oldLocation
            }
        })

        if (enemiesCollidingWithMe.length > 0) {
            this.nudge(this, enemiesCollidingWithMe)
            this.checkForCollisionsWith(this._shapesCollidingWithMe)
        }
        else {
            this.calculateLocation(deltaTime)
            this._collisionShape.setLocation(this._location)
        }

        if(this._entitiesActivatingMe.length > 0) {
            if(this._weapon) {
                this._weapon.attack()
            }
        }

        this._activationShape.setLocation(this._location)

        this.draw()

        if(this._weapon) {
            this._weapon.update(deltaTime)
        }
    }

    // ----------------------------------------
    //              IHasCollisions
    // ----------------------------------------

    public getCollisionShapes(): ICollidable[] {
        return [this._collisionShape]
    }

    public checkForCollisionsWith(shapes: ICollidable[]): void {
        const collidingShapes = this._collisionShape.isCollidingWithShapes(shapes)
        const collidingEntities: Entity[] = []
        collidingShapes.forEach(collidable => {
            const entity = collidable.getEntity()
            if (!collidingEntities.includes(entity) && entity !== (this as Entity)) {
                collidingEntities.push(entity)
            }
        })
        this._entitiesCollidingWithMe = collidingEntities
        this._shapesCollidingWithMe = collidingShapes
    }

    // ----------------------------------------
    //              IHasActivations
    // ----------------------------------------

    public getActivationShapes(): ICollidable[] {
        return [this._activationShape]
    }

    public checkForActivationsWith(shapes: ICollidable[]): void {
        const activatingShapes = this._activationShape.isCollidingWithShapes(shapes)
        const activatingEntities: Entity[] = []
        activatingShapes.forEach(shape => {
            const entity = shape.getEntity()
            if (!activatingEntities.includes(entity) && entity instanceof Player) {
                activatingEntities.push(entity)
            }
        })
        this._entitiesActivatingMe = activatingEntities
    }

    // ----------------------------------------
    //              IHasAI
    // ----------------------------------------

    public aiTick(): void {
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

    private calculateLocation(deltaTime: number): void {
        if (this._state === EnemyState.Moving) {
            const newVelocity = calculateVelocity(this._direction, this._movementSpeed)
            const newLocation = calculateNewPosition(this._location, newVelocity, deltaTime)
            this._oldLocation = this._location
            this._location = newLocation
        }
        else if (this._state === EnemyState.KnockbackFromDamage) {
            const myLoc = this._location

            const newVelocity: IPoint = {
                x: this._knockbackSpeed * Math.cos(this._knockbackAngle * Math.PI / 180.0),
                y: this._knockbackSpeed * Math.sin(this._knockbackAngle * Math.PI / 180.0)
            }
            const newLocation: IPoint = {
                x: myLoc.x + newVelocity.x * deltaTime,
                y: myLoc.y - newVelocity.y * deltaTime
            }

            this._oldLocation = this._location
            this._location = newLocation
        }
    }

    private isColliding(): boolean {
        return this._entitiesCollidingWithMe.length > 0
    }

    private isActivating(): boolean {
        return this._entitiesActivatingMe.length > 0
    }

    private nudge(me: IEnemy, them: IEnemy[]): void {
        const myLoc = this._location
        const myOldLoc = this._oldLocation
        const distance: IPoint = {
            x: myLoc.x - myOldLoc.x,
            y: myLoc.y - myOldLoc.y
        }

        const combinedDifference: IPoint = {
            x: 0,
            y: 0
        }
        them.forEach(enemy => {
            const loc = enemy.getLocation()
            combinedDifference.x += (myLoc.x - loc.x)
            combinedDifference.y += (myLoc.y - loc.y)
        })

        const distanceMoved = getMagnitude(distance)
        const combinedLength = getMagnitude(combinedDifference)
        const unitCombinedDifference: IPoint = {
            x: combinedDifference.x / combinedLength,
            y: combinedDifference.y / combinedLength
        }
        me.setOldLocation(myLoc)
        me.setLocation({
            x: myLoc.x + unitCombinedDifference.x * distanceMoved,
            y: myLoc.y + unitCombinedDifference.y * distanceMoved
        })
    }
}
