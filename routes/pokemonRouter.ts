import express from "express";
import { Pokemon, Ability } from "../interfaces/types";
import { GetPokemonByName, GetAbilities, GetAbilityFromAbilitiesDatabaseByName, UpdatePokemon } from "../database";
import { secureMiddleware } from "../secureMiddleware";


export function pokemonRouter() {
    const router = express.Router();

    router.get("/pokemon/:pokemonname", secureMiddleware, async (req, res) => {
        const pokemonName = req.params.pokemonname;
    
        const filteredPokeData: Pokemon | null = await GetPokemonByName(pokemonName);
    
        if (filteredPokeData === null) {
            res.status(404).render("404", { message: "Pokémon not found" });
        }
        else {
            res.render("pokemon-detail", {
                pokeData: filteredPokeData,
                user: req.session.user
            });
        }
    });
    
    router.get("/pokemon/:pokemonname/edit", secureMiddleware, async (req, res) => {
        const chosenPokemon = req.params.pokemonname;
    
        const filteredPokeData: Pokemon | null = await GetPokemonByName(chosenPokemon);
        const availableAbilities: Ability[] = await GetAbilities();
    
        if (req.session.user) {
            if (req.session.user.role === "USER") {
                res.redirect("/");
            }
            else if (req.session.user.role === "ADMIN") {
                res.render("edit", {
                    pokeData: filteredPokeData,
                    abilityData: availableAbilities,
                    error: "",
                    user: req.session.user
                });
            }        
        }        
    });
    
    router.post("/pokemon/:pokemonname/edit", async (req, res) => {
        const chosenPokemon = req.params.pokemonname;
        const filteredPokeData: Pokemon | null = await GetPokemonByName(chosenPokemon);
        const availableAbilities: Ability[] = await GetAbilities();
    
        let nickname: string = req.body.nickname;
        let description: string = req.body.description;
        let meta: boolean = req.body.meta === "yes" ? true : false;
        let ability: string = req.body.ability;
    
        const updatedAbility: Ability | null = await GetAbilityFromAbilitiesDatabaseByName(ability);
    
        if (nickname === "" || description === "") {
            res.render("edit", { 
                pokeData: filteredPokeData,
                abilityData: availableAbilities,
                error: "Alle velden moeten ingevuld zijn!",
                user: req.session.user
            });
        }
        else if (updatedAbility === null) {
            res.status(404).render("404", { message: "Something went wrong" });
        } else {
            await UpdatePokemon(chosenPokemon, nickname, description, meta, updatedAbility);
            res.redirect("/pokemon/" + chosenPokemon);
        }
    });

    return router;
}