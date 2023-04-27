const { get_client } = require('../sharedStorageService/sharedStorageService');
const { gen_payload } = require("../helpers/helpers")
const {pollLockStreaming, acquireLock, releaseLock} = require("../handlers/handlers");

describe('pollLockStreaming test', () => {
    let client;
    let stream;
    let req;
    const MIN_LIFETIME_MS = 10000;
    const template = {
        owner: "owner",
        ticket: "ticket",
        lifetime: MIN_LIFETIME_MS,
    };

    beforeEach(() => {
        // Create a client to connect to the server
        client = get_client();
        req = gen_payload(template);

        stream = pollLockStreaming(client);

        stream.on('end', () => {
            stream.end();
        });
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            stream.cancel();
            client.close();
        }catch(_e){}
    });

    it('pollLockStreaming with empty ticket', async () => {
        const responsePromise = new Promise((resolve, reject) => {
            stream.write(req);

            stream.on('data', (response) => {
                expect(response.isBlocked).toBeFalsy();
                resolve(response);
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });

        const response = await responsePromise;
        expect(response.isBlocked).toBeFalsy();
    });

});