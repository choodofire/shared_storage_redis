import { getRedisClient } from '../../redis/redis-client.js';
import eventLogger from "../../monitoring/eventLogger.js";

const redisClient = getRedisClient();

export function pollLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket } = call.request;

        // Check record is locked
        redisClient.get(ticket, (err, result) => {
            if (!result) {
                const timeSpent = Date.now() - start;

                callback(null, {
                    isError: false,
                    lock: call.request,
                    timeSpent,
                    isBlocked: false });
            }
            const timeSpent = Date.now() - start;

            callback(null, {
                isError: false,
                lock: call.request,
                timeSpent,
                isBlocked: true });
        });

    } catch (err) {
        console.log('pollLock Error', err);
        eventLogger('error', {
            message: err.message,
            stack: err.stack,
            caughtAt: 'pollLock',
        });
    }
}