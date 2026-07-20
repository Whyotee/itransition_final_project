import "dotenv/config";

export const config = {
  isProd: process.env.NODE_ENV === "production",
  port: process.env.PORT || 4000,
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",

  
  appUrl: process.env.APP_URL || "http://localhost:5173",

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};
