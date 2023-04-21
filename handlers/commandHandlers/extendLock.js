import { getRedisClient } from '../../redis/redis-client.js';
import eventLogger from "../../monitoring/eventLogger.js";

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
                    console.log('Im in recursion')
                    extendLock(call, callback)
                }
            });
        });
    } catch (err) {
        console.log('extendLock Error', err);
        eventLogger('error', {
            message: err.message,
            stack: err.stack,
            caughtAt: 'extendLock',
        });
    }
    

}