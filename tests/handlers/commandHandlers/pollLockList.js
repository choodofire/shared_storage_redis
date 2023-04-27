module.exports = pollLockList = (request, client) =>
    new Promise((resolve, reject) => {
        client.pollLockList(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });