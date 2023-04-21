import { getRedisClient } from '../../redis/redis-client.js';
import eventLogger from "../../monitoring/eventLogger.js";

const redisClient = getRedisClient();

export function releaseLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket, owner } = call.request;

        // Checking if record is locked
        redisClient.get(ticket, (err, result) => {
            if (!result) {
                const timeSpent = Date.now() - start;

                callback(null, {
                    isError: true,
                    lock: call.request,
                    timeSpent,
                    message: 'Record is not blocked' });
            }

            const ticketInfo = JSON.parse(result);
            const oldOwner = ticketInfo.owner;
            if (!oldOwner || oldOwner !== owner) {
                const timeSpent = Date.now() - start;

                callback(null, {
                    isError: true,
                    lock: call.request,
                    timeSpent,
                    message: 'You are not owner' });
            }

            // Unblock if record is locked
            redisClient.del(ticket, (err, result) => {
                if (result) {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: false,
                        lock: call.request,
                        timeSpent,
                        message: 'Record unlocked successfully' });
                } else {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: true,
                        lock: call.request,
                        timeSpent,
                        message: 'Unlock error' });
                }
            });
        });
    } catch (err) {
        console.log('releaseLock Error', err);
        eventLogger('error', {
            message: err.message,
            stack: err.stack,
            caughtAt: 'releaseLock',
        });
    }
}