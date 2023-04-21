import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function acquireLock(call, callback) {
    try {
        const start = Date.now();

        const { ticket, ...values } = call.request;
        const { lifetime } = values;

        // Check record is locked
        redisClient.get(ticket, (err, result) => {
            if (result) {
                const timeSpent = Date.now() - start;

                callback(null, {
                    isError: true,
                    lock: call.request,
                    timeSpent,
                    message: 'Record is already blocked' });
                return;
            }

            // Trying to set up lock
            redisClient.set(ticket, JSON.stringify(values), 'PX', lifetime, 'NX', (err, result) => {
                if (result) {
                    const timeSpent = Date.now() - start;

                    callback(null, {
                        isError: false,
                        lock: call.request,
                        timeSpent,
                        message: 'Lock was placed successfully' });
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
    } catch (e) {
        console.log('acquireLock Error');
        console.error(e.stack);
    }
}