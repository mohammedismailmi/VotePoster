import { type Poster, type InsertPoster, type Vote, type InsertVote, posters, votes } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getPosters(): Promise<Poster[]>;
  getPoster(id: number): Promise<Poster | undefined>;
  createPoster(poster: InsertPoster): Promise<Poster>;
  vote(vote: InsertVote): Promise<Vote>;
  getVote(sessionId: string, posterId: number): Promise<Vote | undefined>;
  updatePosterVotes(posterId: number, isUpvote: boolean, increment: boolean): Promise<Poster>;
}

export class DatabaseStorage implements IStorage {
  async getPosters(): Promise<Poster[]> {
    const result = await db.select().from(posters);
    return result.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  }

  async getPoster(id: number): Promise<Poster | undefined> {
    const [poster] = await db.select().from(posters).where(eq(posters.id, id));
    return poster;
  }

  async createPoster(insertPoster: InsertPoster): Promise<Poster> {
    const [poster] = await db.insert(posters).values(insertPoster).returning();
    return poster;
  }

  async vote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(insertVote).returning();
    return vote;
  }

  async getVote(sessionId: string, posterId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.sessionId, sessionId), eq(votes.posterId, posterId)));
    return vote;
  }

  async updatePosterVotes(posterId: number, isUpvote: boolean, increment: boolean): Promise<Poster> {
    const [poster] = await db
      .select()
      .from(posters)
      .where(eq(posters.id, posterId));

    if (!poster) throw new Error("Poster not found");

    const updatedPoster = { ...poster };
    if (isUpvote) {
      updatedPoster.upvotes += increment ? 1 : -1;
    } else {
      updatedPoster.downvotes += increment ? 1 : -1;
    }

    const [updated] = await db
      .update(posters)
      .set(updatedPoster)
      .where(eq(posters.id, posterId))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();