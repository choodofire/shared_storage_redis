module.exports = ensureLock = (request, client) =>
    new Promise((resolve, reject) => {
        client.ensureLock(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });