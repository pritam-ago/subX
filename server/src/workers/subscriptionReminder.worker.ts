import { Worker } from 'bullmq';
import { sendReminder } from '../services/subscriptionReminder.service';
import { createRedisConnection } from '../config/redis.config';

const redisConnection = createRedisConnection();

// Create a worker to process the jobs
const worker = new Worker('subscription-reminders', async (job) => {
    await sendReminder(job);
}, {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs at a time
    limiter: {
        max: 100, // Max 100 jobs per time window
        duration: 1000 // Time window in milliseconds
    }
});

// Handle worker events
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});

worker.on('error', (error) => {
    console.error('Worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
});

export default worker; 