import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware.js";

export const attributesRouter = Router();

const TYPES = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];
const CATEGORIES = ["CERTIFICATION", "DOMAIN_KNOWLEDGE", "PERSONAL_INFORMATION", "SOFT_SKILLS"];

const BUILT_IN_ATTRIBUTES = [
  { name: "First Name", type: "TEXT", category: "PERSONAL_INFORMATION" },
  { name: "Last Name", type: "TEXT", category: "PERSONAL_INFORMATION" },
  { name: "Location", type: "TEXT", category: "PERSONAL_INFORMATION" },
];

export async function ensureBuiltInAttributes() {
  for (const a of BUILT_IN_ATTRIBUTES) {
    await prisma.attribute.upsert({
      where: { name: a.name },
      update: { isBuiltIn: true },
      create: { ...a, isBuiltIn: true },
    });
  }
}

function readAttributeInput(body) {
  return {
    name: body.name?.trim(),
    type: TYPES.includes(body.type) ? body.type : "TEXT",
    category: CATEGORIES.includes(body.category) ? body.category : "PERSONAL_INFORMATION",
  };
}

attributesRouter.get("/", async (req, res) => {
  const attributes = await prisma.attribute.findMany({ orderBy: { createdAt: "desc" } });
  res.json(attributes);
});

attributesRouter.post("/", requireAuth, async (req, res) => {
  const { name, type, category } = readAttributeInput(req.body);
  if (!name) return res.status(400).json({ error: "Name is required." });

  try {
    const attribute = await prisma.attribute.create({ data: { name, type, category } });
    res.json(attribute);
  } catch (err) {
    // P2002 = unique constraint failed (a name that already exists).
    if (err.code === "P2002") return res.status(409).json({ error: "That name is already taken." });
    throw err;
  }
});

attributesRouter.put("/:id", requireAuth, async (req, res) => {
  const { name, type, category } = readAttributeInput(req.body);
  if (!name) return res.status(400).json({ error: "Name is required." });

  const existing = await prisma.attribute.findUnique({ where: { id: Number(req.params.id) } });
  if (existing?.isBuiltIn) {
    return res.status(403).json({ error: "Built-in attributes cannot be edited." });
  }

  try {
    const attribute = await prisma.attribute.update({
      where: { id: Number(req.params.id) },
      data: { name, type, category },
    });
    res.json(attribute);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "That name is already taken." });
    throw err;
  }
});

attributesRouter.delete("/:id", requireAuth, async (req, res) => {
  const attribute = await prisma.attribute.findUnique({ where: { id: Number(req.params.id) } });
  if (attribute?.isBuiltIn) {
    return res.status(403).json({ error: "Built-in attributes cannot be deleted." });
  }
  await prisma.attribute.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
