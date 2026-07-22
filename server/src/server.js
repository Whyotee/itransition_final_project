import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import { config } from "./config.js";
import { authRouter } from "./auth.js";
import { attributesRouter, ensureBuiltInAttributes } from "./attributes.js";
import { profileRouter } from "./profile.js";
import { positionsRouter } from "./positions.js";
import { usersRouter } from "./users.js";
import { cvsRouter } from "./cv.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.join(__dirname, "../../client/dist");

const app = express();

app.use(express.json()); 

app.use(express.static(clientDistPath));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      httpOnly: true, 
      sameSite: "lax",
      secure: config.cookiesShouldBeSecure, 
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

app.use("/api/users", usersRouter);

app.use("/api/cvs", cvsRouter);

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(clientDistPath, "index.html"));
  } else {
    next();
  }
});

ensureBuiltInAttributes().catch((err) => console.error("Failed to seed built-in attributes:", err));

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
