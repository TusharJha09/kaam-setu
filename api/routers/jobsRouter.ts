import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import {
  createJob,
  listCities,
  listJobs,
  listJobsByEmployer,
  platformStats,
  recommendJobs,
  setJobStatus,
} from "../queries/jobs";
import { findProfileByUserId } from "../queries/profiles";
import { JOB_CATEGORIES } from "@db/schema";

const listInput = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  wageType: z.string().optional(),
  urgentOnly: z.boolean().optional(),
});

const createInput = z.object({
  title: z.string().min(3, "Title is too short").max(255),
  titleHi: z.string().max(255).optional(),
  category: z.enum(JOB_CATEGORIES),
  company: z.string().min(2).max(255),
  city: z.string().min(2).max(100),
  area: z.string().max(255).optional(),
  salaryMin: z.number().int().min(1),
  salaryMax: z.number().int().min(1),
  wageType: z.enum(["daily", "monthly"]),
  phone: z.string().min(6).max(20),
  experience: z.string().max(255).optional(),
  benefits: z.array(z.string().max(100)).max(8).optional(),
  description: z.string().max(2000).optional(),
  urgent: z.boolean().optional(),
});

export const jobsRouter = createRouter({
  list: publicQuery.input(listInput).query(({ input }) => listJobs(input)),

  cities: publicQuery.query(() => listCities()),

  stats: publicQuery.query(() => platformStats()),

  myPosted: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "employer") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Employer profile required" });
    }
    return listJobsByEmployer(profile.id);
  }),

  create: authedQuery.input(createInput).mutation(async ({ ctx, input }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "employer") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Employer profile required" });
    }
    if (input.salaryMax < input.salaryMin) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Maximum salary must be greater than minimum",
      });
    }
    return createJob({
      ...input,
      employerId: profile.id,
      verified: profile.verified,
      benefits: JSON.stringify(input.benefits ?? []),
      status: "open",
    });
  }),

  setStatus: authedQuery
    .input(z.object({ id: z.number().int(), status: z.enum(["open", "closed"]) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await findProfileByUserId(ctx.user.id);
      if (!profile || profile.role !== "employer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Employer profile required" });
      }
      await setJobStatus(input.id, profile.id, input.status);
      return { ok: true };
    }),

  recommendations: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "worker") return [];
    return recommendJobs(profile.id);
  }),
});
