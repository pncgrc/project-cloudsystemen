import { MONGODB_URI } from "./database";
import session, { MemoryStore } from "express-session";
import { User, FlashMessage } from "./interfaces/types";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

if (!MONGODB_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

const mongoStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    databaseName: "login-express",
});

declare module 'express-session' {
    export interface SessionData {
        user?: User;
        message?: FlashMessage;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});