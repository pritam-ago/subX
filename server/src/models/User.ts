import mongoose, { Document, Model } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    subscriptions: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    subscriptions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Subscription"
    }
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
