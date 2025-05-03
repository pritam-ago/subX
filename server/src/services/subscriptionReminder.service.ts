import { Queue } from 'bullmq';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { createRedisConnection } from '../config/redis.config';

const redisConnection = createRedisConnection();

const reminderQueue = new Queue('subscription-reminders', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const checkUpcomingSubscriptions = async () => {
    try {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const now = new Date();

        console.log('Checking subscriptions between:', {
            now: now.toISOString(),
            sevenDaysFromNow: sevenDaysFromNow.toISOString()
        });

        const upcomingSubscriptions = await Subscription.find({
            status: 'active',
            dueDate: {
                $lte: sevenDaysFromNow,
                $gt: now // Only future dates
            }
        }).populate('userId');

        console.log('Found upcoming subscriptions:', upcomingSubscriptions.length);
        
        if (upcomingSubscriptions.length > 0) {
            console.log('Subscription details:', upcomingSubscriptions.map(sub => ({
                id: sub._id,
                service: sub.service,
                dueDate: sub.dueDate,
                userId: sub.userId
            })));

            // Add jobs to the queue for each subscription
            for (const subscription of upcomingSubscriptions) {
                const job = await reminderQueue.add('send-reminder', {
                    subscriptionId: subscription._id,
                    userId: subscription.userId,
                    service: subscription.service,
                    dueDate: subscription.dueDate
                }, {
                    jobId: `reminder-${subscription._id}-${Date.now()}`,
                    delay: 0, // Send immediately
                });
                console.log('Added reminder job:', job.id);
            }
        }

        console.log(`Added ${upcomingSubscriptions.length} reminder jobs to queue`);
    } catch (error) {
        console.error('Error checking upcoming subscriptions:', error);
    }
};

export const sendReminder = async (job: any) => {
    const { subscriptionId, userId, service, dueDate } = job.data;
    
    try {
        console.log('Processing reminder job:', {
            jobId: job.id,
            subscriptionId,
            userId,
            service,
            dueDate: new Date(dueDate).toISOString()
        });

        // Here you would implement your actual notification logic
        // For example, sending an email or push notification
        console.log(`Sending reminder for subscription ${subscriptionId} to user ${userId}`);
        console.log(`Service: ${service} is due on ${new Date(dueDate).toISOString()}`);
        
        // TODO: Implement actual notification logic
        // This could be email, push notification, etc.
    } catch (error) {
        console.error('Error sending reminder:', error);
        throw error;
    }
}; 