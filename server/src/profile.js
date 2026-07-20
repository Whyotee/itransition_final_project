import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./middleware.js";

export const profileRouter = Router();


profileRouter.get("/", requireAuth, async (req, res) => {
  const values = await prisma.profileValue.findMany({
    where: { userId: req.session.userId },
    select: { attributeId: true, value: true },
  });
  res.json(values);
});


profileRouter.put("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const values = req.body.values ?? [];
  
  await Promise.all(
    values.map((v) =>
      prisma.profileValue.upsert({
        where: { userId_attributeId: { userId, attributeId: v.attributeId } },
        update: { value: String(v.value ?? "") },
        create: { userId, attributeId: v.attributeId, value: String(v.value ?? "") },
      })
    )
  );

  res.json({ ok: true });
});
