import { getRedisClient } from '../../redis/redis-client.js';

const redisClient = getRedisClient();

export function pollLockList(call, callback) {
    try {
        const start = Date.now();
        const pollRequests = call.request.requests;

        const responses = [];
        let isBlockedAll = false;

        pollRequests.forEach(pollRequest => {
            // Check if record is locked
            redisClient.get(pollRequest.ticket, (err, result) => {
                const isBlocked = Boolean(result);

                if (isBlocked) {
                    isBlockedAll = true;
                }

                const timeSpent = Date.now() - start;

                const response = {
                    isError: false,
                    lock: pollRequest,
                    timeSpent,
                    isBlocked,
                };
                responses.push(response);

                if (responses.length === pollRequests.length) {
                    callback(null, { responses, isBlocked: isBlockedAll });
                }
            });
        });
    } catch (e) {
        console.error('pollLockList Error');
        console.error(e.stack);
    }
}
