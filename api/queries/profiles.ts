import { eq } from "drizzle-orm";
import { profiles } from "@db/schema";
import type { InsertProfile, Profile } from "@db/schema";
import { getDb } from "./connection";

export async function findProfileByUserId(userId: number): Promise<Profile | undefined> {
  const rows = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return rows.at(0);
}

export async function findProfileById(id: number): Promise<Profile | undefined> {
  const rows = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return rows.at(0);
}

export async function upsertProfileByUserId(
  userId: number,
  data: Omit<InsertProfile, "userId" | "id">,
): Promise<Profile> {
  const db = getDb();
  const existing = await findProfileByUserId(userId);
  if (existing) {
    await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
    const updated = await findProfileByUserId(userId);
    return updated!;
  }
  await db.insert(profiles).values({ ...data, userId });
  const created = await findProfileByUserId(userId);
  return created!;
}
