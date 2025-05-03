import cron from 'node-cron';
import { checkUpcomingSubscriptions } from '../services/subscriptionReminder.service';

// For testing: Run every minute
// In production, change this back to '0 0 * * *' for daily at midnight
export const startSubscriptionScheduler = () => {
    cron.schedule('* * * * *', async () => {
        console.log('Running subscription check...', new Date().toISOString());
        await checkUpcomingSubscriptions();
    });
    
    console.log('Subscription scheduler started - Running every minute for testing');
}; 