import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function pollLockStreaming(call) {
    try {
        call.on('data', (lockRequest) => {
            const start = Date.now();

            redisClient.get(lockRequest.ticket, (err, result) => {
                const isBlocked = Boolean(result);
                const timeSpent = Date.now() - start;
                call.write({
                    isError: false,
                    lock: lockRequest,
                    timeSpent,
                    isBlocked
                });
            });
        });

        call.on('pollLockStreaming end', () => {
            call.end();
        });

        call.on('error', (err) => {
            console.error('pollLockStreaming Error', err);
            call.end();
        });

        call.on('cancelled', () => {
            console.log('pollLockStreaming Cancelled');
            call.end();
        });
    } catch (e) {
        console.error('pollLockStreaming error');
        console.error(e.stack);
    }
}
