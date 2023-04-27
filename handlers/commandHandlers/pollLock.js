import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function pollLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket } = call.request;

        // Check record is locked
        redisClient.get(ticket, (err, result) => {
            const isBlocked = Boolean(result);
            const timeSpent = Date.now() - start;
            callback(null, {
                isError: false,
                lock: call.request,
                timeSpent,
                isBlocked
            });
        });

    } catch (e) {
        console.error('pollLock Error');
        console.error(e.stack);
    }
}