import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "../middleware";
import {
  createApplication,
  findJobById,
  listApplicationsByWorker,
  listApplicationsForEmployer,
  listSavedJobs,
  setApplicationStatus,
  toggleSavedJob,
} from "../queries/jobs";
import { findProfileByUserId } from "../queries/profiles";

export const applicationsRouter = createRouter({
  submit: authedQuery
    .input(z.object({ jobId: z.number().int(), message: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await findProfileByUserId(ctx.user.id);
      if (!profile || profile.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Worker profile required" });
      }
      const job = await findJobById(input.jobId);
      if (!job || job.status !== "open") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job is no longer open" });
      }
      try {
        await createApplication({
          jobId: input.jobId,
          workerId: profile.id,
          message: input.message,
        });
      } catch {
        // unique constraint — already applied
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already applied to this job",
        });
      }
      return { ok: true };
    }),

  myApplications: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "worker") return [];
    return listApplicationsByWorker(profile.id);
  }),

  myApplicants: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "employer") return [];
    return listApplicationsForEmployer(profile.id);
  }),

  setStatus: authedQuery
    .input(
      z.object({
        applicationId: z.number().int(),
        status: z.enum(["pending", "accepted", "rejected"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await findProfileByUserId(ctx.user.id);
      if (!profile || profile.role !== "employer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Employer profile required" });
      }
      await setApplicationStatus(input.applicationId, profile.id, input.status);
      return { ok: true };
    }),

  toggleSaved: authedQuery
    .input(z.object({ jobId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await findProfileByUserId(ctx.user.id);
      if (!profile || profile.role !== "worker") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Worker profile required" });
      }
      return toggleSavedJob(input.jobId, profile.id);
    }),

  saved: authedQuery.query(async ({ ctx }) => {
    const profile = await findProfileByUserId(ctx.user.id);
    if (!profile || profile.role !== "worker") return [];
    return listSavedJobs(profile.id);
  }),
});
