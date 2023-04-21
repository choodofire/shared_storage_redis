module.exports = releaseLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.releaseLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });