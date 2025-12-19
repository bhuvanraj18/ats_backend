const { Queue } = require('bullmq');

// Ensure you have a Redis instance running
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
};

const notificationQueue = new Queue('notificationQueue', { connection });

exports.addNotification = async (data) => {
    return await notificationQueue.add('sendEmail', data);
};
