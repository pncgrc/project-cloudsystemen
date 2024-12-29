import express from "express";
import { GetPokemon } from "../database";
import { secureMiddleware } from "../secureMiddleware";
import { Pokemon } from "../interfaces/types";

export function homeRouter() {
    const router = express.Router();

    router.get("/", secureMiddleware, async (req, res) => {

        const q: string = typeof req.query.q === "string" ? req.query.q : "";
        const sortBy: string = typeof req.query.sortby === "string" ? req.query.sortby : "id";
        const sortDirection: string = typeof req.query.sortdirection === "string" ? req.query.sortdirection : "asc";
    
        const pokeData: Pokemon[] = await GetPokemon();
        let filteredPokeData: Pokemon[] = pokeData;
    
        filteredPokeData = filteredPokeData.filter((pokemon) => {
            return pokemon.name.toLowerCase().includes(q.toLowerCase());
        });
    
        filteredPokeData = filteredPokeData.sort((a, b) => {
            if (sortBy === "id") {
                return sortDirection === "asc" ? a.order - b.order : b.order - a.order;
            }
            else if (sortBy === "name") {
                return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            else if (sortBy === "type") {
                return sortDirection === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
            }
            else if (sortBy === "meta") {
                if (sortDirection === "asc") {
                    return a.active === b.active ? 0 : a.active ? -1 : 1;
                } else {
                    return a.active === b.active ? 0 : a.active ? 1 : -1;
                }
            }
            else {
                return 0;
            }
        });

        const sortFields = [
            { value: 'name', text: 'Name' },
            { value: 'id', text: 'Pokédex ID'},
            { value: 'type', text: 'Type' },
            { value: 'meta', text: 'Meta pick' }
        ];

        res.render("index", {
            pokeData: filteredPokeData,
            q: q,
            sortFields: sortFields,
            sortby: sortBy,
            sortdirection: sortDirection,
            user: req.session.user,
            message: res.locals.message
        });
    });

    return router;
}