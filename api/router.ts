import { authRouter } from "./auth-router";
import { jobsRouter } from "./routers/jobsRouter";
import { profileRouter } from "./routers/profileRouter";
import { applicationsRouter } from "./routers/applicationsRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  jobs: jobsRouter,
  profile: profileRouter,
  applications: applicationsRouter,
});

export type AppRouter = typeof appRouter;
