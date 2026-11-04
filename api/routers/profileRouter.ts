import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import {
  findProfileByUserId,
  upsertProfileByUserId,
} from "../queries/profiles";
import { JOB_CATEGORIES } from "@db/schema";

const saveInput = z.object({
  role: z.enum(["worker", "employer"]),
  displayName: z.string().min(2).max(255),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  skills: z.array(z.enum(JOB_CATEGORIES)).max(12).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  preferredWage: z.enum(["daily", "monthly", "any"]).optional(),
  bio: z.string().max(1000).optional(),
  companyName: z.string().max(255).optional(),
});

export const profileRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    return profile ?? null;
  }),

  save: authedQuery.input(saveInput).mutation(async ({ ctx, input }) => {
    const existing = await findProfileByUserId(ctx.user.id);
    const data = {
      role: input.role,
      displayName: input.displayName,
      phone: input.phone ?? null,
      city: input.city ?? null,
      skills:
        input.role === "worker" ? (input.skills ?? []).join(",") : (existing?.skills ?? null),
      experienceYears:
        input.role === "worker"
          ? (input.experienceYears ?? existing?.experienceYears ?? null)
          : (existing?.experienceYears ?? null),
      preferredWage:
        input.role === "worker"
          ? (input.preferredWage ?? existing?.preferredWage ?? "any")
          : (existing?.preferredWage ?? "any"),
      bio: input.bio ?? existing?.bio ?? null,
      companyName:
        input.role === "employer" ? (input.companyName ?? null) : (existing?.companyName ?? null),
      verified: existing?.verified ?? false,
    };
    return upsertProfileByUserId(ctx.user.id, data);
  }),
});
