import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  SkillPath AI Backend Service Running`);
    console.log(`  Port:        ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  LLM Mode:    ${config.llmProvider}`);
    console.log(`  Health API:  http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
