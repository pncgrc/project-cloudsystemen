import express from "express";
import { User } from "../interfaces/types";
import { Login, RegisterUser } from "../database";

export function loginRouter() {
    const router = express.Router();

    router.get("/login", (req, res) => {
        if (req.session.user) {
            res.redirect("/");
        }
        else {
            res.render("login");
        }    
    });
    
    router.post("/login", async (req, res) => {
        const username: string = req.body.username;
        const password: string = req.body.password;
        try {
            let user: User = await Login(username, password);
            delete user.password; 
            req.session.user = user;
            req.session.message = {type: "success", message: "Login successful"};
            res.redirect("/");
        } catch (e: any) {
            req.session.message = {type: "error", message: e.message};
            res.redirect("/login");
        }
    });
    
    router.post("/logout", async (req, res) => {
        req.session.destroy(() => {
            res.redirect("/login");
        });
    });

    router.get("/register", (req, res) => {
        if (req.session.user) {
            res.redirect("/");
        }
        else {
            res.render("register");
        }    
    });
    
    router.post("/register", async (req, res) => {
        const username: string = req.body.username;
        const password: string = req.body.password;
        try {
            await RegisterUser(username, password);
            req.session.message = {type: "success", message: "Registration successful"};
            res.redirect("/login");
        } catch (e: any) {
            req.session.message = {type: "error", message: e.message};
            res.redirect("/register");
        }
    });

    return router;
}