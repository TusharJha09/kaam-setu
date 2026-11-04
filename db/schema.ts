import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  int,
  boolean,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const JOB_CATEGORIES = [
  "driver",
  "delivery",
  "construction",
  "electrician",
  "plumbing",
  "maid",
  "cook",
  "security",
  "factory",
  "farm",
  "retail",
  "other",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const profiles = mysqlTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true })
      .notNull()
      .unique(),
    role: mysqlEnum("role", ["worker", "employer"]).notNull().default("worker"),
    displayName: varchar("displayName", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    city: varchar("city", { length: 100 }),
    // worker-specific
    skills: text("skills"), // comma-separated category keys
    experienceYears: int("experienceYears"),
    preferredWage: mysqlEnum("preferredWage", ["daily", "monthly", "any"])
      .notNull()
      .default("any"),
    bio: text("bio"),
    // employer-specific
    companyName: varchar("companyName", { length: 255 }),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    cityIdx: index("profiles_city_idx").on(table.city),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export const jobs = mysqlTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    employerId: bigint("employerId", { mode: "number", unsigned: true }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    titleHi: varchar("titleHi", { length: 255 }),
    category: mysqlEnum("category", JOB_CATEGORIES).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    area: varchar("area", { length: 255 }),
    salaryMin: int("salaryMin").notNull(),
    salaryMax: int("salaryMax").notNull(),
    wageType: mysqlEnum("wageType", ["daily", "monthly"]).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    experience: varchar("experience", { length: 255 }),
    benefits: text("benefits"), // JSON array of strings
    description: text("description"),
    urgent: boolean("urgent").notNull().default(false),
    verified: boolean("verified").notNull().default(false),
    status: mysqlEnum("status", ["open", "closed"]).notNull().default("open"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryIdx: index("jobs_category_idx").on(table.category),
    cityIdx: index("jobs_city_idx").on(table.city),
    statusIdx: index("jobs_status_idx").on(table.status),
    wageIdx: index("jobs_wage_idx").on(table.wageType),
  }),
);

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

export const applications = mysqlTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: bigint("jobId", { mode: "number", unsigned: true }).notNull(),
    workerId: bigint("workerId", { mode: "number", unsigned: true }).notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "rejected"])
      .notNull()
      .default("pending"),
    message: text("message"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    jobWorkerUnique: uniqueIndex("applications_job_worker_unique").on(
      table.jobId,
      table.workerId,
    ),
    workerIdx: index("applications_worker_idx").on(table.workerId),
    jobIdx: index("applications_job_idx").on(table.jobId),
  }),
);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const savedJobs = mysqlTable(
  "saved_jobs",
  {
    id: serial("id").primaryKey(),
    jobId: bigint("jobId", { mode: "number", unsigned: true }).notNull(),
    workerId: bigint("workerId", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    jobWorkerUnique: uniqueIndex("saved_jobs_job_worker_unique").on(
      table.jobId,
      table.workerId,
    ),
    workerIdx: index("saved_jobs_worker_idx").on(table.workerId),
  }),
);

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = typeof savedJobs.$inferInsert;
