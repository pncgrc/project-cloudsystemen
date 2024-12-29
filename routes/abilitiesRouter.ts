import express from "express";
import { Pokemon, Ability } from "../interfaces/types";
import { GetPokemonTeamAbilities, GetAbilityOnPokemonByName } from "../database";
import { secureMiddleware } from "../secureMiddleware";


export function abilitiesRouter() {
    const router = express.Router();

    router.get("/abilities", secureMiddleware, async (req, res) => {
        const pokeAbilities: Ability[] = await GetPokemonTeamAbilities();
        res.render("pokemon-abilities", { pokeAbilities: pokeAbilities, user: req.session.user });
    });
    
    router.get("/abilities/:abilityname", secureMiddleware, async (req, res) => {
        const abilityName = req.params.abilityname;
    
        const filteredPokeData: Pokemon | null = await GetAbilityOnPokemonByName(abilityName);
    
        if (filteredPokeData === null) {
            res.status(404).render("404", { message: "Ability not found" });
        }
        else {
            res.render("ability-detail", {
                pokeData: filteredPokeData,
                user: req.session.user
            });
        }
    });

    return router;
}