import { IPlayer, IWeapon, WeaponState } from '.';
import { ICollidable } from '../collision/collidable.h';
import { Entity } from './entity';

export abstract class Weapon extends Entity implements IWeapon {
    attack(): void {
        throw new Error("Method not implemented.");
    }
    getState(): WeaponState {
        throw new Error("Method not implemented.");
    }
    attachToPlayer(player: IPlayer): void {
        player
        throw new Error("Method not implemented.");
    }
    detachFromPlayer(): void {
        throw new Error("Method not implemented.");
    }
    draw(): void {
        throw new Error("Method not implemented.");
    }
    update(deltaTime?: number): void {
        deltaTime
        throw new Error("Method not implemented.");
    }
    getCollisionShapes(): ICollidable[] {
        throw new Error("Method not implemented.");
    }
    checkForCollisionsWith(shapes: ICollidable[]): void {
        shapes
        throw new Error("Method not implemented.");
    }
}