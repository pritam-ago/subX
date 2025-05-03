import IORedis from 'ioredis';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
};

export const createRedisConnection = () => {
    const redis = new IORedis(redisConfig);

    redis.on('error', (error) => {
        console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
    });

    return redis;
};

export default redisConfig; 