import { IPoint } from "../../gui";
import { EnemyState } from "../entities";

export interface EnemyLoad {
    location: IPoint
    enemyState: EnemyState
}