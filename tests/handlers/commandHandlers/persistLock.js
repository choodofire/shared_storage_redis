module.exports = persistLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.persistLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });