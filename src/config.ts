import { Colors } from './gui'
import { EnemyState } from './core/entities'

export const Config = {
    Players: {
        ShowCollisionBoxes: false,
        MainColor: Colors.Blue,
        SecondaryColor: Colors.Green,
        InvincibleColor: Colors.Blue
    },
    Enemies: {
        ShowCollisionBoxes: false,
        MainColor: Colors.Red,
        SecondaryColor: Colors.Green,
        InvincibleColor: Colors.Blue,
        DefaultState: EnemyState.TargetDummy
    },
    Weapons: {
        ShowCollisionBoxes: false,
        Color: Colors.Black
    },
    Rooms: {
        ShowWallCollisionBoxes: false,
        WallColor: Colors.Black
    },
    Doors: {
        ShowActivationBoxes: false,
        ShowCollisionBoxes: false,
        MainColor: Colors.Brown,
        SecondaryColor: Colors.DarkBrown,
        TertiaryColor: Colors.Black
    },
    Transitions: {
        ShowCollisionBoxes: false,
        Color: Colors.Blue
    },
    Walls: {
        ShowCollisionBoxes: false,
        OutlineColor: Colors.Black,
        FillColor: Colors.Gray
    },
    MyScreen: {
        BackgroundColor: Colors.Gainsboro
    },
    Collisions: {
        NoCollisionColor: Colors.Green,
        YesCollisionColor: Colors.Red
    }
}
