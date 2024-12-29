import { Pokemon, Ability, User } from "./interfaces/types";
import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }
export const client = new MongoClient(MONGODB_URI);

/*** COLLECTION USERS ***/

const userCollection = client.db("login-express").collection<User>("users");

const saltRounds: number = 10;

async function CreateInitialUsers() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let adminUsername: string | undefined = process.env.ADMIN_USERNAME;
    let adminPassword: string | undefined = process.env.ADMIN_PASSWORD;

    let userUsername: string | undefined = process.env.USER_USERNAME;
    let userPassword: string | undefined = process.env.USER_PASSWORD;

    if (adminUsername === undefined || adminPassword === undefined || userUsername === undefined || userPassword === undefined) {
        throw new Error("ADMIN_USERNAME, ADMIN_PASSWORD, USER_USERNAME & USER_PASSWORD must be set in environment");
    }
    await userCollection.insertMany([
        { username: adminUsername, password: await bcrypt.hash(adminPassword, saltRounds), role: "ADMIN" },
        { username: userUsername, password: await bcrypt.hash(userPassword, saltRounds), role: "USER" }
    ]);
}

export async function Login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Username and password required");
    }
    let user : User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function RegisterUser(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Username and password required");
    }
    let user: User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        throw new Error("User already exists");
    } else {
        await userCollection.insertOne({username: username, password: await bcrypt.hash(password, saltRounds), role: "USER"});
    }
}


/*** COLLECTIONS POKEMON & ABILITY ***/

const pokemonCollection: Collection<Pokemon> = client.db("poketeam").collection<Pokemon>("pokemon");
const abilitiesCollection: Collection<Ability> = client.db("poketeam").collection<Ability>("abilities");

async function FillDatabase() {
    let pokemonTeam = await pokemonCollection.find({}).toArray();
    if (pokemonTeam.length === 0) {
        const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-pncgrc/main/project/pokemon.json");
        const pokeData = await response.json();
        await pokemonCollection.insertMany(pokeData);
    }

    let myAbilities = await abilitiesCollection.find({}).toArray();
    if (myAbilities.length === 0) {
        const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-pncgrc/main/project/abilities.json");
        const abilityData = await response.json();
        await abilitiesCollection.insertMany(abilityData);
    }
}

export async function GetPokemon() {
    return await pokemonCollection.find({}).toArray();
}

export async function GetAbilities() {
    return await abilitiesCollection.find({}).toArray();
}

export async function GetPokemonByName(pokemonName: string) {
    return await pokemonCollection.findOne<Pokemon>({ name: pokemonName });  
}

export async function GetAbilityFromAbilitiesDatabaseByName(abilityName: string) {
    return await abilitiesCollection.findOne<Ability>({name: abilityName});
}

export async function GetAbilityOnPokemonByName(abilityName: string) {
    return await pokemonCollection.findOne<Pokemon>({ "favoriteAbility.name": abilityName });
}

export async function GetPokemonTeamAbilities() {
    const pokemonData: Pokemon[] = await pokemonCollection.find({}).toArray();
    let teamAbilities: Ability[] = [];

    for (let pokemon of pokemonData) { teamAbilities.push(pokemon.favoriteAbility); }

    return teamAbilities;
}

export async function UpdatePokemon(pokemon: string, nickname: string, description: string, meta: boolean, ability: Ability) {
    pokemonCollection.updateOne({name: pokemon}, {$set: {
        nickname: nickname,
        description: description,
        active: meta,
        favoriteAbility: ability
    }});
}

export async function DBConnect() {
    try {
        await client.connect();
        await FillDatabase();
        await CreateInitialUsers();
        console.log("Successfully connected to the database"); 
        process.on("SIGINT", DBExit); // Ctrl + C handling
    } catch (e) {
        console.error("Error connecting to the database:", e);
    }
}

async function DBExit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error("Error while disconnecting from database:", error);
    }
    process.exit(0);
}