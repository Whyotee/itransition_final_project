import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware.js";

export const cvsRouter = Router();

cvsRouter.get("/", requireAuth, async (req, res) => {
  const cvs = await prisma.cv.findMany({
    where: { userId: req.session.userId },
    orderBy: { createdAt: "desc" },
    include: { position: { select: { title: true } } },
  });
  res.json(cvs);
});

cvsRouter.post("/", requireAuth, async (req, res) => {
  const positionId = Number(req.body.positionId);
  if (!positionId) return res.status(400).json({ error: "Pick a position." });

  try {
    const cv = await prisma.cv.create({
      data: { userId: req.session.userId, positionId },
    });
    res.json(cv);
  } catch (err) {   
    if (err.code === "P2002") {
      return res.status(409).json({ error: "You already have a CV for this position." });
    }
    throw err;
  }
});

cvsRouter.get("/:id", requireAuth, async (req, res) => {
  const cv = await prisma.cv.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      position: true,
      user: { select: { id: true, name: true } },
    },
  });
  if (!cv) return res.status(404).json({ error: "CV not found." });

  const viewer = await prisma.user.findUnique({ where: { id: req.session.userId } });
  const isOwner = cv.userId === viewer.id;
  if (!isOwner && viewer.role !== "ADMIN" && viewer.role !== "RECRUITER") {
    return res.status(403).json({ error: "You don't have permission to view this CV." });
  }
 
  const profileValues = await prisma.profileValue.findMany({
    where: { userId: cv.userId },
    include: { attribute: { select: { name: true, type: true, category: true } } },
  });

  const values = profileValues.map((pv) => ({
    attributeId: pv.attributeId,
    name: pv.attribute.name,
    type: pv.attribute.type,
    category: pv.attribute.category,
    value: pv.value,
  }));

  res.json({
    id: cv.id,
    createdAt: cv.createdAt,
    position: cv.position,
    owner: cv.user,
    values,
  });
});
