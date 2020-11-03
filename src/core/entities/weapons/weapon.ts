import { IWeapon, WeaponState } from '.';
import { IPlayer } from '..';
import { ICollidable } from '../../collision/collidable.h';
import { IEnemy } from '../enemy.h';
import { Entity } from '../entity';

export abstract class Weapon extends Entity implements IWeapon {
    attack(): void {
        throw new Error("Method not implemented.");
    }
    getState(): WeaponState {
        throw new Error("Method not implemented.");
    }
    attachToCharacter(character: IPlayer | IEnemy): void {
        character
        throw new Error("Method not implemented.");
    }
    detachFromCharacter(): void {
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
