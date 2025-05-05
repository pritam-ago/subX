import mongoose, { Document, Model } from "mongoose";
import { IUser } from "./User";

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId | IUser;
    name: string;
    amount: number;
    billingCycle: "monthly" | "quarterly" | "yearly";
    nextBillingDate: Date;
    reminderDays: number;
    status: "active" | "inactive";
    createdAt: Date;
}

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        required: true
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    reminderDays: {
        type: Number,
        required: true,
        default: 3
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;



