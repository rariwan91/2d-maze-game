import { constants } from 'buffer'
import { IColor } from './color.h'

export class Colors {
    public static Red: IColor = { r: 255, g: 0, b: 0 }
    public static Green: IColor = { r: 0, g: 255, b: 0 }
    public static Blue: IColor = { r: 0, g: 0, b: 255 }
    public static White: IColor = { r: 255, g: 255, b: 255 }
    public static Black: IColor = { r: 0, g: 0, b: 0 }
}
