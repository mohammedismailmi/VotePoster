import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { insertPosterSchema } from "@shared/schema";

const SessionStore = MemoryStore(session);

export function registerRoutes(app: Express): Server {
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new SessionStore({ checkPeriod: 86400000 }),
    resave: false,
    saveUninitialized: true,
    secret: 'poster-voting-secret'
  }));

  app.get('/api/posters', async (_req, res) => {
    const posters = await storage.getPosters();
    res.json(posters);
  });

  // New endpoint for creating posters
  app.post('/api/posters', async (req, res) => {
    try {
      const validatedData = insertPosterSchema.parse(req.body);
      const poster = await storage.createPoster(validatedData);
      res.status(201).json({
        message: 'Poster created successfully',
        poster
      });
    } catch (error) {
      console.error('Create poster error:', error);
      res.status(400).json({
        message: 'Failed to create poster',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/posters/:id/vote', async (req, res) => {
    const posterId = parseInt(req.params.id);
    const { isUpvote } = req.body;
    const sessionId = req.session.id;

    if (!sessionId) {
      return res.status(401).json({
        message: 'Session not found'
      });
    }

    try {
      // Check if user already voted
      const existingVote = await storage.getVote(sessionId, posterId);

      if (existingVote) {
        return res.status(400).json({ 
          message: 'You have already voted on this poster',
          status: 'error'
        });
      }

      // Create new vote and update poster votes atomically
      await storage.vote({ posterId, sessionId, isUpvote });
      const updatedPoster = await storage.updatePosterVotes(posterId, isUpvote, true);

      if (!updatedPoster) {
        throw new Error('Failed to update poster votes');
      }

      res.json({ 
        message: 'Vote recorded successfully',
        status: 'success',
        poster: updatedPoster
      });
    } catch (error) {
      console.error('Voting error:', error);
      res.status(500).json({ 
        message: 'Failed to record vote',
        status: 'error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}