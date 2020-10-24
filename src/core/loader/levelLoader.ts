import * as level from '../../level.json'
import { LevelLoad } from './levelLoad.h'

export class LevelLoader {
    public static loadLevel(): LevelLoad {
        return level as unknown as LevelLoad
    }
}
