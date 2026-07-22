import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "./lib/prisma.js";
import { config } from "./config.js";

export const authRouter = Router();

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_PROFILE = "https://api.github.com/user";

const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_PROFILE = "https://www.googleapis.com/oauth2/v3/userinfo";

const callbackUrl = `${config.appUrl}/api/auth/github/callback`;
const googleCallbackUrl = `${config.appUrl}/api/auth/google/callback`;

function isAdminEmail(email) {
  return Boolean(email) && config.adminEmails.includes(email.toLowerCase());
}

async function fetchGithubEmail(accessToken) {
  const res = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "cv-platform" },
  });
  const emails = await res.json();
  if (!Array.isArray(emails)) return null;
  const primary = emails.find((e) => e.primary && e.verified) ?? emails[0];
  return primary?.email ?? null;
}

authRouter.get("/github", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex"); 
  req.session.oauthState = state; 

  const url = new URL(GITHUB_AUTHORIZE);
  url.searchParams.set("client_id", config.github.clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("scope", "read:user user:email"); 
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

authRouter.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!state || state !== req.session.oauthState) {
    return res.status(400).send("Invalid state");
  }

  const tokenRes = await fetch(GITHUB_TOKEN, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
      redirect_uri: callbackUrl,
    }),
  });
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch(GITHUB_PROFILE, {
    headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "cv-platform" },
  });
  const profile = await profileRes.json();

  const email = profile.email ?? (await fetchGithubEmail(access_token));
  
  const updateData = {
    name: profile.name ?? profile.login,
    avatarUrl: profile.avatar_url,
  };
  if (isAdminEmail(email)) {
    updateData.role = "ADMIN";
  }

  const user = await prisma.user.upsert({
    where: { githubId: String(profile.id) },
    update: updateData,
    create: {
      githubId: String(profile.id),
      name: profile.name ?? profile.login,
      email,
      avatarUrl: profile.avatar_url,
      role: isAdminEmail(email) ? "ADMIN" : "CANDIDATE",
    },
  });

  req.session.userId = user.id;
  res.redirect(config.appUrl);
});


authRouter.get("/google", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;

  const url = new URL(GOOGLE_AUTHORIZE);
  url.searchParams.set("client_id", config.google.clientId);
  url.searchParams.set("redirect_uri", googleCallbackUrl);
  url.searchParams.set("response_type", "code"); 
  url.searchParams.set("scope", "openid email profile"); 
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});


authRouter.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!state || state !== req.session.oauthState) {
    return res.status(400).send("Invalid state");
  }


  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      code,
      redirect_uri: googleCallbackUrl,
      grant_type: "authorization_code", 
    }),
  });
  const { access_token } = await tokenRes.json();

 
  const profileRes = await fetch(GOOGLE_PROFILE, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await profileRes.json(); 

  const updateData = {
    name: profile.name,
    avatarUrl: profile.picture,
  };
  if (isAdminEmail(profile.email)) {
    updateData.role = "ADMIN";
  }

  const user = await prisma.user.upsert({
    where: { googleId: profile.sub },
    update: updateData,
    create: {
      googleId: profile.sub,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.picture,
      role: isAdminEmail(profile.email) ? "ADMIN" : "CANDIDATE",
    },
  });

  
  req.session.userId = user.id;
  res.redirect(config.appUrl);
});

authRouter.get("/me", async (req, res) => {
  if (!req.session.userId) return res.json(null);
  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  res.json(user);
});


authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});
