import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { createApp } from './app.js';
import { initializeCloudinary } from './services/cloudinaryService.js';
import { isAiAnalysisEnabled } from './services/aiService.js';

async function main() {
  const cloudinaryEnabled = initializeCloudinary();
  const aiAnalysisEnabled = isAiAnalysisEnabled();
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`CivicSense API listening on http://localhost:${env.port}`);
    console.log(
      `Image uploads: ${cloudinaryEnabled ? 'enabled (Cloudinary)' : 'disabled (Cloudinary not configured)'}`
    );
    console.log(
      `AI analysis: ${aiAnalysisEnabled ? `enabled (${env.groq.model})` : 'disabled (GROQ_API_KEY not configured)'}`
    );
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
