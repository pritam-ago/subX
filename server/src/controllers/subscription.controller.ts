import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import User from "../models/User";

interface AddSubscriptionRequest {
    service: string;
    duration: number;
    price: number;
    startDate?: Date;
}

export const addSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { service, duration, price, startDate }: AddSubscriptionRequest = req.body;

        if (!service || !duration || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
        const dueDate = new Date(subscriptionStartDate);
        dueDate.setDate(dueDate.getDate() + duration);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subscription = new Subscription({
            userId,
            service,
            duration,
            price,
            startDate: subscriptionStartDate,
            dueDate,
            status: "active"
        });
        await subscription.save();
        user.subscriptions.push(subscription._id);
        await user.save();

        res.status(201).json({
            message: "Subscription added successfully",
            subscription: {
                id: subscription._id,
                service: subscription.service,
                duration: subscription.duration,
                price: subscription.price,
                startDate: subscription.startDate,
                dueDate: subscription.dueDate,
                status: subscription.status
            }
        });
    } catch (error) {
        console.error("Add subscription error:", error);
        res.status(500).json({ message: "Error adding subscription" });
    }
};

export const getSubscriptions = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const subscriptions = await Subscription.find({ userId });
    res.status(200).json(subscriptions);
};

export const updateSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(subscription);
};

export const deleteSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Subscription.findByIdAndDelete(id);
    res.status(200).json({ message: "Subscription deleted successfully" });
};
