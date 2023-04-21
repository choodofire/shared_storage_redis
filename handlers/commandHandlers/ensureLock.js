import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function ensureLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket, ...values } = call.request;
        const { lifetime, owner } = values;

        // Check record is locked
        redisClient.get(ticket, (err, result) => {
            if (result) {
                result = JSON.parse(result);
                const ownerResult = result.owner;

                if (owner !== ownerResult) {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: true,
                        lock: call.request,
                        timeSpent,
                        message: 'Record is already blocked by another owner' });
                    return;
                }

                // Trying to set up lock with same owner
                redisClient.set(ticket, JSON.stringify(values), 'PX', lifetime, (err, result) => {

                    if (result) {
                        const timeSpent = Date.now() - start;

                        callback(null, {
                            isError: false,
                            lock: call.request,
                            timeSpent,
                            message: 'Lock was placed successfully with to your record'});
                    } else {
                        const timeSpent = Date.now() - start;

                        callback(null, {
                            isError: true,
                            lock: call.request,
                            timeSpent,
                            message: 'Error with ensureLock' });
                    }
                });
            } else {
                // Trying to set up lock without lock
                redisClient.set(ticket, JSON.stringify(values), 'PX', lifetime, 'NX', (err, result) => {
                    if (result) {
                        const timeSpent = Date.now() - start;

                        callback(null, {
                            isError: false,
                            lock: call.request,
                            timeSpent,
                            message: 'Lock was placed successfully' });
                    } else {
                        console.log('Im in recursion')
                        ensureLock(call, callback)
                    }
                });
            }
        });
    } catch (e) {
        console.log('ensureLock Error');
        console.error(e.stack);
    }
}