import express from "express";
import { DBConnect } from "./database";
import dotenv from "dotenv";
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";
import { flashMiddleware } from "./flashMiddleware";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import { pokemonRouter } from "./routes/pokemonRouter";
import { abilitiesRouter } from "./routes/abilitiesRouter";

const app = express();
dotenv.config();

app.set("view engine", "ejs"); // View engine
app.set("port", process.env.PORT || 3000); // Port definition

app.use(express.json({ limit: "1mb" })); // Post routes
app.use(express.urlencoded({ extended:true})); // Post routes
app.use(express.static("public")); // Public folder usage
app.use(session); // session middleware
app.use(flashMiddleware); //flash message middleware

// Routers
app.use(loginRouter()); // Routes: "/login" (get & post), "/logout" (post)
app.use(homeRouter()); // Routes: "/" (get)
app.use(pokemonRouter()); // Routes: "/pokemon/:pokemonname" (get), "/pokemon/:pokemonname/edit" (get & post)
app.use(abilitiesRouter()); // Routes: "/abilities" (get), "/abilities/:abilityname" (get)

app.use(secureMiddleware, (req, res, next) => {
    res.status(404).render("404", { message: "Page not found" });
});

app.listen(app.get("port"), async () => {
    try {
        await DBConnect();
        console.log( "[server] http://localhost:" + app.get("port"));
    } catch (e) {
        console.log(e);
        process.exit(1);
    }    
});