import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAdmin } from "./middleware.js";

export const usersRouter = Router();

const ROLES = ["CANDIDATE", "RECRUITER", "ADMIN"];

usersRouter.get("/", requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(users);
});

usersRouter.put("/:id/role", requireAdmin, async (req, res) => {
  if (!ROLES.includes(req.body.role)) {
    return res.status(400).json({ error: "Invalid role." });
  }
  
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { role: req.body.role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(user);
});
