import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function extendLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket, owner, lifetime } = call.request;

        // Check record is locked
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

            // Change lifetime
            redisClient.pexpire(ticket, lifetime, (err, result) => {
                if (result) {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: false,
                        lock: call.request,
                        timeSpent,
                        message: 'Lifetime set successfully' });
                } else {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: true,
                        lock: call.request,
                        timeSpent,
                        message: 'Extend error' });
                }
            });
        });
    } catch (e) {
        console.error('extendLock Error');
        console.error(e.stack);
    }
    

}