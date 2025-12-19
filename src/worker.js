const { Worker } = require('bullmq');
require('dotenv').config();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
};

const processed = {}; // Mock in-memory store to verify emails sent

const emailWorker = new Worker('notificationQueue', async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log('Job Data:', job.data);

    // Mock Email Sending
    if (job.name === 'sendEmail') {
        const { type, email, applicationId, newStage, jobId } = job.data;

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(`[MOCK EMAIL] Sent to ${email || 'user'} regarding ${type}`);
        processed[job.id] = job.data;
    }
}, { connection });

emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
    console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker started...');

// Export for verification if needed, causing side effect of running.
module.exports = emailWorker;
