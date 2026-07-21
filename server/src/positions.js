import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware.js";

export const positionsRouter = Router();

positionsRouter.get("/", async (req, res) => {
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } }, 
  });
  res.json(positions);
});

positionsRouter.post("/", requireAuth, async (req, res) => {
  const title = req.body.title?.trim();
  if (!title) return res.status(400).json({ error: "Title is required." });

  const position = await prisma.position.create({
    data: {
      title,
      description: req.body.description?.trim() || null,
      createdById: req.session.userId,
    },
  });
  res.json(position);
});
