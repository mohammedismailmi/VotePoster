import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posters = pgTable("posters", {
  id: serial("id").primaryKey(),
  teamName: text("team_name").notNull(),
  imageUrl: text("image_url").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  posterId: integer("poster_id").notNull(),
  sessionId: text("session_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
});

export const insertPosterSchema = createInsertSchema(posters).pick({
  teamName: true,
  imageUrl: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  posterId: true,
  sessionId: true,
  isUpvote: true,
});

export type InsertPoster = z.infer<typeof insertPosterSchema>;
export type Poster = typeof posters.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
