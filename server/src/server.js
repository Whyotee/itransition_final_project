import "dotenv/config";
import express from "express";
import session from "express-session";
import { config } from "./config.js";
import { authRouter } from "./auth.js";
import { attributesRouter, ensureBuiltInAttributes } from "./attributes.js";
import { profileRouter } from "./profile.js";
import { positionsRouter } from "./positions.js";

const app = express();

app.use(express.json()); 

app.use(
  session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      httpOnly: true, 
      sameSite: "lax",
      secure: config.isProd, 
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);


app.use("/api/attributes", attributesRouter);

app.use("/api/profile", profileRouter);

app.use("/api/positions", positionsRouter);


ensureBuiltInAttributes().catch((err) => console.error("Failed to seed built-in attributes:", err));

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
