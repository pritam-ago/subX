import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import User from "../models/User";

interface SubscriptionRequest {
    name: string;
    amount: number;
    billingCycle: "monthly" | "quarterly" | "yearly";
    nextBillingDate: Date;
    reminderDays: number;
}

export const addSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { name, amount, billingCycle, nextBillingDate, reminderDays }: SubscriptionRequest = req.body;

        if (!name || !amount || !billingCycle || !nextBillingDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subscription = new Subscription({
            userId,
            name,
            amount,
            billingCycle,
            nextBillingDate: new Date(nextBillingDate),
            reminderDays: reminderDays || 3,
            status: "active"
        });
        await subscription.save();

        res.status(201).json({
            message: "Subscription added successfully",
            subscription: {
                id: subscription._id,
                name: subscription.name,
                amount: subscription.amount,
                billingCycle: subscription.billingCycle,
                nextBillingDate: subscription.nextBillingDate,
                reminderDays: subscription.reminderDays,
                status: subscription.status
            }
        });
    } catch (error) {
        console.error("Add subscription error:", error);
        res.status(500).json({ message: "Error adding subscription" });
    }
};

export const getSubscriptions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const subscriptions = await Subscription.find({ userId });
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Get subscriptions error:", error);
        res.status(500).json({ message: "Error fetching subscriptions" });
    }
};

export const getSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        
        const subscription = await Subscription.findOne({ _id: id, userId });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json(subscription);
    } catch (error) {
        console.error("Get subscription error:", error);
        res.status(500).json({ message: "Error fetching subscription" });
    }
};

export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const { name, amount, billingCycle, nextBillingDate, reminderDays, status } = req.body;

        const subscription = await Subscription.findOne({ _id: id, userId });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            id,
            {
                name,
                amount,
                billingCycle,
                nextBillingDate: new Date(nextBillingDate),
                reminderDays,
                status
            },
            { new: true }
        );

        res.status(200).json(updatedSubscription);
    } catch (error) {
        console.error("Update subscription error:", error);
        res.status(500).json({ message: "Error updating subscription" });
    }
};

export const deleteSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const subscription = await Subscription.findOne({ _id: id, userId });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        await Subscription.findByIdAndDelete(id);
        res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
        console.error("Delete subscription error:", error);
        res.status(500).json({ message: "Error deleting subscription" });
    }
};
