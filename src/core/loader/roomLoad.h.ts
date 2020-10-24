import { DoorLoad } from "./doorLoad.h";
import { EnemyLoad } from "./enemyLoad.h";
import { TextLoad } from "./textLoad.h";

export interface RoomLoad {
    name: string
    enemies: EnemyLoad[]
    text: TextLoad[]
    doors: DoorLoad[]
}