import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and CORS
app.use(
  cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount central API router
app.use('/api', apiRouter);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource ${req.originalUrl} not found`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
