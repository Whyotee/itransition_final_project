import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware.js";

export const attributesRouter = Router();

const TYPES = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];

attributesRouter.get("/", async (req, res) => {
  const attributes = await prisma.attribute.findMany({ orderBy: { createdAt: "desc" } });
  res.json(attributes);
});

attributesRouter.post("/", requireAuth, async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: "Name is required." });

 
  const type = TYPES.includes(req.body.type) ? req.body.type : "TEXT";

  const attribute = await prisma.attribute.create({ data: { name, type } });
  res.json(attribute);
});
