import { prisma } from "./lib/prisma.js";

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "You must be logged in." });
  }
  next();
}

export async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "You must be logged in." });
  }
  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "You don't have permission to do this." });
  }
  next();
}

export async function requireRecruiterOrAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "You must be logged in." });
  }
  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
    return res.status(403).json({ error: "You don't have permission to do this." });
  }
  next();
}
