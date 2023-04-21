module.exports = acquireLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.acquireLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });