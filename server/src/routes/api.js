import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';

const apiRouter = Router();

// Modular Sub-routers
apiRouter.use('/health', healthRoutes);
apiRouter.use('/roadmaps', roadmapRoutes);

// Modular Placeholders for subsequent phases
apiRouter.post('/doubts/ask', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'RAG Doubt Solving endpoint ready for PR-1 integration. See Module 2 architecture.',
  });
});

apiRouter.post('/revision/generate', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Personalized Revision endpoint ready for Phase 7 integration.',
  });
});

apiRouter.post('/interviews/start', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Adaptive AI Interview endpoint ready for Phase 8 integration.',
  });
});

export default apiRouter;
