module.exports = extendLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.extendLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });