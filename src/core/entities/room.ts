const createGraph = require('ngraph.graph')

import { Colors, IPoint, IRectangle, ISize, IText } from '../../gui'
import { Direction, IMyScreen } from '..'
import { Door, Enemy, IDoor, IEnemy, IPlayer, IRoom, IRoomTransition, IWall, RoomState, RoomTransition, Wall } from '.'
import { addVectors, areRectanglesOverlapping, getVectorDistanceBetween, offsetVector } from '../../helpers'

import { Config } from '../../config'
import { Entity } from './entity'

export class Room extends Entity implements IRoom {
    private _location: IPoint = { x: 50, y: 50 }
    private readonly _size: ISize
    private readonly _myScreen: IMyScreen
    private _walls: IWall[] = []
    private _extraWalls: IWall[] = []
    private _roomToNorth: IRoom
    private _roomToRight: IRoom
    private _roomToSouth: IRoom
    private _roomToLeft: IRoom
    private _northDoor: IDoor
    private _rightDoor: IDoor
    private _southDoor: IDoor
    private _leftDoor: IDoor
    private _northRoomTransition: IRoomTransition
    private _rightRoomTransition: IRoomTransition
    private _southRoomTransition: IRoomTransition
    private _leftRoomTransition: IRoomTransition
    private _enemies: IEnemy[] = []
    private _text: IText[] = []
    private readonly _player: IPlayer
    private _roomState = RoomState.Normal
    private _graphPoints: IPoint[] = []
    private _validNodes = new Map<string, IPoint>()
    private _invalidNodes = new Map<string, IPoint>()
    private _graph: unknown
    private _validPaths: Map<string, string[]>

    constructor(myScreen: IMyScreen, player: IPlayer) {
        super()
        this._myScreen = myScreen
        this._size = {
            width: myScreen.getSize().width - 100,
            height: myScreen.getSize().height - 100
        }
        this._player = player
        this.createWalls()
    }

    // ----------------------------------------
    //              IRoom
    // ----------------------------------------

    public getLocation(): IPoint {
        return this._location
    }

    public setLocation(newLocation: IPoint): void {
        const difference = getVectorDistanceBetween(this._location, newLocation)
        this._location = newLocation
        this._walls.forEach(w => {
            const wLoc = w.getLocation()
            w.setLocation({ x: wLoc.x + difference.x, y: wLoc.y + difference.y })
        })
        this._extraWalls.forEach(w => {
            const wLoc = w.getLocation()
            w.setLocation({ x: wLoc.x + difference.x, y: wLoc.y + difference.y })
        })

        if (this._northDoor) {
            this._northDoor.setLocation(this.getDoorLocation(Direction.Up))
        }

        if (this._leftDoor) {
            this._leftDoor.setLocation(this.getDoorLocation(Direction.Left))
        }

        if (this._southDoor) {
            this._southDoor.setLocation(this.getDoorLocation(Direction.Down))
        }

        if (this._rightDoor) {
            this._rightDoor.setLocation(this.getDoorLocation(Direction.Right))
        }

        if (this._northRoomTransition) {
            this._northRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Up))
        }

        if (this._rightRoomTransition) {
            this._rightRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Right))
        }

        if (this._southRoomTransition) {
            this._southRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Down))
        }

        if (this._leftRoomTransition) {
            this._leftRoomTransition.setLocation(this.getRoomTransitionLocation(Direction.Left))
        }

        this._enemies.forEach(e => {
            const eLoc = e.getLocation()
            e.setLocation({ x: eLoc.x + difference.x, y: eLoc.y + difference.y })
        })

        this._text.forEach(t => {
            const tLoc = t.location
            t.location = { x: tLoc.x + difference.x, y: tLoc.y + difference.y }
        })
    }

    public getSize(): ISize {
        return this._size
    }

    public pairWithRoom(myExitDirection: Direction.Up | Direction.Down | Direction.Left | Direction.Right, room: IRoom): void {
        this.setRoomExit(myExitDirection, room)
        let theirExitDirection: Direction
        if (myExitDirection === Direction.Up) {
            theirExitDirection = Direction.Down
        }
        else if (myExitDirection === Direction.Down) {
            theirExitDirection = Direction.Up
        }
        else if (myExitDirection === Direction.Left) {
            theirExitDirection = Direction.Right
        }
        else {
            theirExitDirection = Direction.Left
        }

        room.setRoomExit(theirExitDirection, this)
    }

    public setRoomExit(direction: Direction.Up | Direction.Down | Direction.Left | Direction.Right, room: IRoom): void {
        if (direction === Direction.Up) {
            this._roomToNorth = room
        }
        else if (direction === Direction.Right) {
            this._roomToRight = room
        }
        else if (direction === Direction.Down) {
            this._roomToSouth = room
        }
        else {
            this._roomToLeft = room
        }

        this.createWalls()
        this.createDoors()
        this.createRoomTransitions()
    }

    public getDoors(): IDoor[] {
        return [this._northDoor, this._rightDoor, this._southDoor, this._leftDoor].filter(d => d)
    }

    public doorOpened(door: IDoor): void {
        if (this._northDoor === door) {
            this._northDoor = null
        }
        else if (this._leftDoor === door) {
            this._leftDoor = null
        }
        else if (this._southDoor === door) {
            this._southDoor = null
        }
        else if (this._rightDoor === door) {
            this._rightDoor = null
        }
    }

    public getRoomTransitions(): IRoomTransition[] {
        return [this._northRoomTransition, this._rightRoomTransition, this._southRoomTransition, this._leftRoomTransition].filter(rt => rt)
    }

    public addEnemyToRoom(enemy: IEnemy): void {
        const eLocation = enemy.getLocation()
        enemy.setLocation({ x: eLocation.x + this._location.x, y: eLocation.y + this._location.y })
        this._enemies.push(enemy)
        enemy.setRoom(this)
    }

    public getEnemies(): IEnemy[] {
        return this._enemies
    }

    public enemyDied(entity: Entity): void {
        const index = this._enemies.indexOf(entity as Enemy)
        this._enemies.splice(index, 1)
    }

    public getRoomState(): RoomState {
        return this._roomState
    }

    public setRoomState(newRoomState: RoomState): void {
        this._roomState = newRoomState
    }

    public getPlayer(): IPlayer {
        return this._player
    }

    public addTextToRoom(text: IText): void {
        this._text.push(text)
    }

    public getWalls(): IWall[] {
        return this._walls.concat(this._extraWalls)
    }

    public addWallToRoom(wall: IWall): void {
        const wallLocation = wall.getLocation()
        wall.setLocation({ x: wallLocation.x + this._location.x, y: wallLocation.y + this._location.y })
        this._extraWalls.push(wall)
    }

    public getRoomGraph(): unknown {
        if(this._graph) return this._graph

        const validNodes = new Map<string, IPoint>()
        const invalidNodes = new Map<string, IPoint>()
        const validPaths = new Map<string, string[]>()
        const graph = createGraph()

        for(let x = 0; x <= this._size.width; x += 25) {
            for(let y = 0; y <= this._size.height; y += 25) {
                const nodeLocation = offsetVector(addVectors(this._location, { x, y }), -12.5)
                let isWall = false
                for(const wall of this._walls) {
                    const nodeRect: IRectangle = { location: nodeLocation, size: { width: 25, height: 25 } }
                    const wallRect = wall.getRectangle()
                    const biggerWallRect: IRectangle = { location: { x: wallRect.location.x - 25, y: wallRect.location.y - 25 }, size: { width: wallRect.size.width + 25, height: wallRect.size.height + 25 } }
                    if(areRectanglesOverlapping(nodeRect, biggerWallRect)) {
                        isWall = true
                        break
                    }
                }

                for(const wall of this._extraWalls) {
                    const nodeRect: IRectangle = { location: nodeLocation, size: { width: 25, height: 25 } }
                    const wallRect = wall.getRectangle()
                    const biggerWallRect: IRectangle = { location: { x: wallRect.location.x - 25, y: wallRect.location.y - 25 }, size: { width: wallRect.size.width + 50, height: wallRect.size.height + 50 } }
                    if(areRectanglesOverlapping(nodeRect, biggerWallRect)) {
                        isWall = true
                        break
                    }
                }

                if(!isWall) {
                    const nodeLabel = `${nodeLocation.x}_${nodeLocation.y}`
                    validNodes.set(nodeLabel, nodeLocation)
                    graph.addNode(`${nodeLocation.x}_${nodeLocation.y}`, { location: nodeLocation })
                    this._graphPoints.push(nodeLocation)
                }
                else {
                    const nodeLabel = `${nodeLocation.x}_${nodeLocation.y}`
                    invalidNodes.set(nodeLabel, nodeLocation)
                }
            }
        }

        for(let x = 0; x <= this._size.width; x += 25) {
            for(let y = 0; y <= this._size.height; y += 25) {
                const node: IPoint = offsetVector(addVectors(this._location, { x, y }), -12.5)

                const northNode: IPoint = { x: node.x, y: node.y - 25 }
                const northEastNode: IPoint = { x: node.x + 25, y: node.y - 25 }
                const eastNode: IPoint = { x: node.x + 25, y: node.y }
                const southEastNode: IPoint = { x: node.x + 25, y: node.y + 25 }
                const southNode: IPoint = { x: node.x, y: node.y + 25 }
                const southWestNode: IPoint = { x: node.x - 25, y: node.y + 25 }
                const westNode: IPoint = { x: node.x - 25, y: node.y }
                const northWestNode: IPoint = { x: node.x - 25, y: node.y - 25 }

                const nodeLabel = `${node.x}_${node.y}`
                const northNodeLabel = `${northNode.x}_${northNode.y}`
                const northEastNodeLabel = `${northEastNode.x}_${northEastNode.y}`
                const eastNodeLabel = `${eastNode.x}_${eastNode.y}`
                const southEastNodeLabel = `${southEastNode.x}_${southEastNode.y}`
                const southNodeLabel = `${southNode.x}_${southNode.y}`
                const southWestNodeLabel = `${southWestNode.x}_${southWestNode.y}`
                const westNodeLabel = `${westNode.x}_${westNode.y}`
                const northWestNodeLabel = `${northWestNode.x}_${northWestNode.y}`

                if(!validNodes.has(nodeLabel)) continue

                validPaths.set(nodeLabel, [])

                if(validNodes.has(northNodeLabel)) {
                    validPaths.get(nodeLabel).push(northNodeLabel)
                    graph.addLink(nodeLabel, northNodeLabel, { weight: 25, direction: Direction.Up })
                }
                if(validNodes.has(northEastNodeLabel)) {
                    validPaths.get(nodeLabel).push(northEastNodeLabel)
                    graph.addLink(nodeLabel, northEastNodeLabel, { weight: 35, direction: Direction.UpRight })
                }
                if(validNodes.has(eastNodeLabel)) {
                    validPaths.get(nodeLabel).push(eastNodeLabel)
                    graph.addLink(nodeLabel, eastNodeLabel, { weight: 25, direction: Direction.Right })
                }
                if(validNodes.has(southEastNodeLabel)) {
                    validPaths.get(nodeLabel).push(southEastNodeLabel)
                    graph.addLink(nodeLabel, southEastNodeLabel, { weight: 35, direction: Direction.DownRight })
                }
                if(validNodes.has(southNodeLabel)) {
                    validPaths.get(nodeLabel).push(southNodeLabel)
                    graph.addLink(nodeLabel, southNodeLabel, { weight: 25, direction: Direction.Down })
                }
                if(validNodes.has(southWestNodeLabel)) {
                    validPaths.get(nodeLabel).push(southWestNodeLabel)
                    graph.addLink(nodeLabel, southWestNodeLabel, { weight: 35, direction: Direction.DownLeft })
                }
                if(validNodes.has(westNodeLabel)) {
                    validPaths.get(nodeLabel).push(westNodeLabel)
                    graph.addLink(nodeLabel, westNodeLabel, { weight: 25, direction: Direction.Left })
                }
                if(validNodes.has(northWestNodeLabel)) {
                    validPaths.get(nodeLabel).push(northWestNodeLabel)
                    graph.addLink(nodeLabel, northWestNodeLabel, { weight: 35, direction: Direction.UpLeft })
                }
            }
        }

        this._validPaths = validPaths
        this._validNodes = validNodes
        this._invalidNodes = invalidNodes
        this._graph = graph
        return graph
    }

    public isValidPoint(point: IPoint): boolean {
        return this._validNodes.has(`${point.x}_${point.y}`)
    }

    // ----------------------------------------
    //              IDrawable
    // ----------------------------------------

    public draw(): void {
        // Draw floor tiles
        for (let x = 0; x <= this._size.width; x += this._size.width / 20) {
            this._myScreen.drawStraightLine({ x: this._location.x + x, y: this._location.y }, { x: this._location.x + x, y: this._location.y + this._size.height }, Colors.LightGray)
        }
        for (let y = 0; y <= this._size.height; y += this._size.height / 15) {
            this._myScreen.drawStraightLine({ x: this._location.x, y: this._location.y + y }, { x: this._location.x + this._size.width, y: this._location.y + y }, Colors.LightGray)
        }

        if(Config.Rooms.ShowMovementGraph) {
            this._validNodes.forEach(point => {
                this._myScreen.drawRect(point, { width: 25, height: 25 }, Colors.Black)
            })
    
            this._invalidNodes.forEach(point => {
                this._myScreen.drawRect(point, { width: 25, height: 25 }, Colors.Red)
            })
        }

        if (this._roomToNorth) {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
            this._myScreen.drawRect({ x: this._location.x + 0.6 * this._size.width, y: this._location.y - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
        }
        else {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y - 10 }, { width: this._size.width + 20, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
        }

        if (this._roomToRight) {
            this._myScreen.drawRect({ x: this._location.x + this._size.width - 10, y: this._location.y + 10 }, { width: 20, height: 0.4 * this._size.height - 10 }, Config.Rooms.WallColor, Colors.Gray)
            this._myScreen.drawRect({ x: this._location.x + this._size.width - 10, y: this._location.y + 0.6 * this._size.height }, { width: 20, height: 0.4 * this._size.height - 10 }, Config.Rooms.WallColor, Colors.Gray)
        }
        else {
            this._myScreen.drawRect({ x: this._location.x + this._size.width - 10, y: this._location.y + 10 }, { width: 20, height: this._size.height - 20 }, Config.Rooms.WallColor, Colors.Gray)
        }

        if (this._roomToSouth) {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + this._size.height - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
            this._myScreen.drawRect({ x: this._location.x + 0.6 * this._size.width, y: this._location.y + this._size.height - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
        }
        else {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + this._size.height - 10 }, { width: this._size.width + 20, height: 20 }, Config.Rooms.WallColor, Colors.Gray)
        }

        if (this._roomToLeft) {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + 10 }, { width: 20, height: 0.4 * this._size.height - 10 }, Config.Rooms.WallColor, Colors.Gray)
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + 0.6 * this._size.height }, { width: 20, height: 0.4 * this._size.height - 10 }, Config.Rooms.WallColor, Colors.Gray)
        }
        else {
            this._myScreen.drawRect({ x: this._location.x - 10, y: this._location.y + 10 }, { width: 20, height: this._size.height - 20 }, Config.Rooms.WallColor, Colors.Gray)
        }

        if (this._text) {
            this._text.forEach(t => {
                this._myScreen.drawText(t.location, t.value, t.size, Colors.Black)
            })
        }
    }

    // ----------------------------------------
    //              IUpdatable
    // ----------------------------------------

    public update(deltaTime: number): void {
        this.draw()

        this._walls.forEach(w => w.update())
        this._extraWalls.forEach(w => w.update())

        if (this._northDoor) {
            this._northDoor.update()
        }

        if (this._leftDoor) {
            this._leftDoor.update()
        }

        if (this._southDoor) {
            this._southDoor.update()
        }

        if (this._rightDoor) {
            this._rightDoor.update()
        }

        if (this._northRoomTransition) {
            this._northRoomTransition.update()
        }

        if (this._rightRoomTransition) {
            this._rightRoomTransition.update()
        }

        if (this._southRoomTransition) {
            this._southRoomTransition.update()
        }

        if (this._leftRoomTransition) {
            this._leftRoomTransition.update()
        }

        this._enemies.forEach(e => {
            e.aiTick()
            e.update(deltaTime)
        })
    }

    // ----------------------------------------
    //              private
    // ----------------------------------------

    private createWalls(): void {
        this._walls = []
        if (this._roomToNorth) {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }),
                new Wall(this._myScreen, { x: this._location.x + 0.6 * this._size.width, y: this._location.y - 10 }, { width: 0.4 * this._size.width + 10, height: 20 })
            )
        }
        else {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y - 10 }, { width: this._size.width + 20, height: 20 })
            )
        }

        if (this._roomToRight) {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x + this._size.width - 10, y: this._location.y + 10 }, { width: 20, height: 0.4 * this._size.height - 10 }),
                new Wall(this._myScreen, { x: this._location.x + this._size.width - 10, y: this._location.y + 0.6 * this._size.height }, { width: 20, height: 0.4 * this._size.height - 10 })
            )
        }
        else {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x + this._size.width - 10, y: this._location.y + 10 }, { width: 20, height: this._size.height - 20 })
            )
        }

        if (this._roomToSouth) {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y + this._size.height - 10 }, { width: 0.4 * this._size.width + 10, height: 20 }),
                new Wall(this._myScreen, { x: this._location.x + 0.6 * this._size.width, y: this._location.y + this._size.height - 10 }, { width: 0.4 * this._size.width + 10, height: 20 })
            )
        }
        else {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y + this._size.height - 10 }, { width: this._size.width + 20, height: 20 })
            )
        }

        if (this._roomToLeft) {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y + 10 }, { width: 20, height: 0.4 * this._size.height - 10 }),
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y + 0.6 * this._size.height }, { width: 20, height: 0.4 * this._size.height - 10 })
            )
        }
        else {
            this._walls.push(
                new Wall(this._myScreen, { x: this._location.x - 10, y: this._location.y + 10 }, { width: 20, height: this._size.height - 20 })
            )
        }
    }

    private createDoors(): void {
        this._northDoor = null
        this._rightDoor = null
        this._southDoor = null
        this._leftDoor = null

        if (this._roomToNorth) {
            this._northDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Up), { height: 16, width: 0.2 * this._size.width }, this)
        }

        if (this._roomToRight) {
            this._rightDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Right), { height: 0.2 * this._size.height, width: 16 }, this)
        }

        if (this._roomToSouth) {
            this._southDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Down), { height: 16, width: 0.2 * this._size.width }, this)
        }

        if (this._roomToLeft) {
            this._leftDoor = new Door(this._myScreen, this.getDoorLocation(Direction.Left), { height: 0.2 * this._size.height, width: 16 }, this)
        }
    }

    private createRoomTransitions(): void {
        this._northRoomTransition = null
        this._rightRoomTransition = null
        this._southRoomTransition = null
        this._leftRoomTransition = null

        if (this._roomToNorth) {
            this._northRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Up), { height: 20, width: 0.3 * this._size.width }, this._roomToNorth)
        }

        if (this._roomToRight) {
            this._rightRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Right), { height: 0.3 * this._size.height, width: 20 }, this._roomToRight)
        }

        if (this._roomToSouth) {
            this._southRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Down), { height: 20, width: 0.3 * this._size.width }, this._roomToSouth)
        }

        if (this._roomToLeft) {
            this._leftRoomTransition = new RoomTransition(this._myScreen, this.getRoomTransitionLocation(Direction.Left), { height: 0.3 * this._size.height, width: 20 }, this._roomToLeft)
        }
    }

    private getDoorLocation(direction: Direction.Up | Direction.Right | Direction.Down | Direction.Left): IPoint {
        if (direction === Direction.Up) {
            return { x: this._location.x + 0.4 * this._size.width, y: this._location.y - 8 }
        }

        if (direction === Direction.Right) {
            return { x: this._location.x + this._size.width - 8, y: this._location.y + 0.4 * this._size.height }
        }

        if (direction === Direction.Down) {
            return { x: this._location.x + 0.4 * this._size.width, y: this._location.y + this._size.height - 8 }
        }

        // Direction.Left
        return { x: this._location.x - 8, y: this._location.y + 0.4 * this._size.height }
    }

    private getRoomTransitionLocation(direction: Direction.Up | Direction.Right | Direction.Down | Direction.Left): IPoint {
        if (direction === Direction.Up) {
            return { x: this._location.x + 0.35 * this._size.width, y: this._location.y - 50 }
        }

        if (direction === Direction.Right) {
            return { x: this._location.x + this._size.width + 30, y: this._location.y + 0.35 * this._size.height }
        }

        if (direction === Direction.Down) {
            return { x: this._location.x + 0.35 * this._size.width, y: this._location.y + this._size.height + 30 }
        }

        // Direction.Left
        return { x: this._location.x - 50, y: this._location.y + 0.35 * this._size.height }
    }
}
