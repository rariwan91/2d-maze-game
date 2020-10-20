import { Guid } from 'guid-typescript'

export abstract class Entity {
    protected readonly _entityId: Guid

    constructor() {
        this._entityId = Guid.create()
    }

    public getEntityId(): Guid {
        return this._entityId
    }
}
