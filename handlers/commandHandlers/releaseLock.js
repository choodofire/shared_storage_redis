import { getRedisClient } from '../../redis/redis-client.js';

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
                return;
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
                return;
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
    } catch (e) {
        console.error('releaseLock Error');
        console.error(e.stack);
    }

}