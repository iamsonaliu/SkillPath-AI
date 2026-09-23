import mongoose from 'mongoose';
import { config } from '../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    llmProvider: config.llmProvider,
    version: '1.0.0',
    service: 'SkillPath AI Core API',
  });
};
