import { Router } from 'express';
import { generateRoadmap, getRoadmapById } from '../controllers/roadmapController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { RoadmapRequestZodSchema } from '../services/roadmap/roadmapSchema.js';

const router = Router();

// POST /api/roadmaps/generate - Generate structured personalized roadmap
router.post('/generate', validateRequest(RoadmapRequestZodSchema), generateRoadmap);

// GET /api/roadmaps/:id - Retrieve roadmap by ID
router.get('/:id', getRoadmapById);

export default router;
