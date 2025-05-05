import Subscription, { ISubscription } from '../models/Subscription';
import User, { IUser } from '../models/User';

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
            nextBillingDate: {
                $lte: sevenDaysFromNow,
                $gt: now // Only future dates
            }
        }).populate<{ userId: IUser }>('userId');

        console.log('Found upcoming subscriptions:', upcomingSubscriptions.length);
        
        if (upcomingSubscriptions.length > 0) {
            for (const subscription of upcomingSubscriptions) {
                const user = subscription.userId as IUser;
                if (!user) continue;

                // Format the due date
                const formattedDueDate = new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                // Log the reminder
                console.log(`Reminder for ${user.name}:`);
                console.log(`Your subscription for ${subscription.name} ($${subscription.amount}) is due on ${formattedDueDate}`);
                console.log('----------------------------------------');
            }
        }
    } catch (error) {
        console.error('Error checking upcoming subscriptions:', error);
    }
}; 