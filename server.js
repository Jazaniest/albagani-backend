import { createApp } from './src/app.js';
import { config } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} (${config.env})`);
});
