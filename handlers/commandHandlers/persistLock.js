import { getRedisClient } from '../../redis/redis-client.js';
import eventLogger from "../../monitoring/eventLogger.js";

const redisClient = getRedisClient();

export function persistLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket, ...values } = call.request;
        delete values.lifetime;

        // Check record is locked
        redisClient.get(ticket, (err, result) => {
            if (result) {
                const timeSpent = Date.now() - start;

                callback(null, {
                    isError: true,
                    lock: call.request,
                    timeSpent,
                    message: 'Record is already blocked' });
            }

            // Trying to set up persist lock
            redisClient.set(ticket, JSON.stringify(values), 'NX', (err, result) => {
                if (result) {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: false,
                        lock: call.request,
                        timeSpent,
                        message: 'Persist lock was placed successfully' });
                } else {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: true,
                        lock: call.request,
                        timeSpent,
                        message: 'Record is already blocked' });
                }
            });
        });
    } catch (err) {
        console.log('persistLock Error', err);
        eventLogger('error', {
            message: err.message,
            stack: err.stack,
            caughtAt: 'persistLock',
        });
    }
}