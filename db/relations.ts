import { relations } from "drizzle-orm";
import { profiles, jobs, applications, savedJobs } from "./schema";

export const profilesRelations = relations(profiles, ({ many }) => ({
  jobs: many(jobs),
  applications: many(applications),
  savedJobs: many(savedJobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  employer: one(profiles, { fields: [jobs.employerId], references: [profiles.id] }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  worker: one(profiles, {
    fields: [applications.workerId],
    references: [profiles.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  job: one(jobs, { fields: [savedJobs.jobId], references: [jobs.id] }),
}));
