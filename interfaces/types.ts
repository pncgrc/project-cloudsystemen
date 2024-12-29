import { ObjectId } from "mongodb";

export interface Pokemon {
    id: number,
    name: string,
    nickname: string,
    description: string,
    order: number,
    active: boolean,
    imageUrl: string,
    type: string,
    hobbies: string[],
    favoriteAbility: Ability
}

export interface Ability {
    id: number,
    name: string,
    type: string,
    power: number | null,
    accuracy: number | null,
    description: string
}

export interface User {
    _id?: ObjectId;
    username: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success"
    message: string;
}