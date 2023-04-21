import Redis from 'ioredis';

let redisClient;

const host = process.env.REDIS_HOST || "localhost"
const port = process.env.REDIS_PORT || 6379

//TODO provide REDIS_HOST and REDIS_PORT properly
//tmp solution for now just to unhardcode it
if (!host || !port){
    throw new Error("REDIS_HOST or REDIS_PORT env vars are not provided")
}

function createRedisClient() {
    console.log('Connecting to Redis');
    redisClient = new Redis({
        host,
        port,
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
    });
}

export function getRedisClient() {
    if (!redisClient) {
        createRedisClient();
    }
    return redisClient;
}