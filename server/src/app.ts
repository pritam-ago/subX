import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { startSubscriptionScheduler } from "./schedulers/subscriptionScheduler.js";
import "./workers/subscriptionReminder.worker.js";

config();
const app = express();

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use(cors());
app.use(express.json());

// Add a test route for root path
app.get('/', (req, res) => {
    res.json({ message: 'Subscription Manager API is running!' });
});

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log("Connected to MongoDB");
        // Start the subscription scheduler after DB connection
        startSubscriptionScheduler();
        const server = app.listen(3000, () => {
            console.log("Server is running on  http://localhost:3000");
        });

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error('Port 3000 is already in use');
            } else {
                console.error('Server error:', error);
            }
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); 
    });

