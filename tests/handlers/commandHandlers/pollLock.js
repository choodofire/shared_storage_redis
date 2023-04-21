module.exports = pollLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.pollLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });