import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { startSubscriptionScheduler } from "./schedulers/subscriptionScheduler.js";

config();
const app = express();

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use(cors({
    origin: true, // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Add test routes
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route working!' });
});

app.post('/test', (req, res) => {
    console.log('Test POST route hit with body:', req.body);
    res.json({ message: 'Test POST route working!', receivedData: req.body });
});

// Add a test route for root path
app.get('/', (req, res) => {
    res.json({ message: 'Subscription Manager API is running!' });
});

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log("Connected to MongoDB");
        startSubscriptionScheduler();
        const server = app.listen( 3000, () => {
            console.log(`Server is running on http://localhost:${ 3000}`);
        });

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${3000} is already in use`);
            } else {
                console.error('Server error:', error);
            }
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); 
    });

