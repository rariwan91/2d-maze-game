import { Colors } from "./gui";

export const Config = {
    Players: {
        ShowCollisionBoxes: true,
        MainColor: Colors.Blue,
        SecondaryColor: Colors.Green,
        InvincibleColor: Colors.Blue
    },
    Enemies: {
        ShowCollisionBoxes: true,
        MainColor: Colors.Red,
        SecondaryColor: Colors.Green,
        InvincibleColor: Colors.Blue
    },
    Weapons: {
        ShowCollisionBoxes: true,
        Color: Colors.Black
    },
    Rooms: {
        ShowWallCollisionBoxes: true,
        WallColor: Colors.Black
    },
    Doors: {
        ShowActivationBoxes: true,
        ShowCollisionBoxes: true,
        MainColor: Colors.Brown,
        SecondaryColor: Colors.DarkBrown,
        TertiaryColor: Colors.Black
    },
    Transitions: {
        ShowCollisionBoxes: true,
        Color: Colors.Blue
    },
    MyScreen: {
        BackgroundColor: Colors.Gainsboro
    },
    Collisions: {
        NoCollisionColor: Colors.Green,
        YesCollisionColor: Colors.Red
    }
}
