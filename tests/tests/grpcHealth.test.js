const { get_client } = require('../sharedStorageService/sharedStorageService');
const { promisify } = require('util');

describe('pollLock test', () => {
    let client;

    beforeEach(() => {
        // Create a client to connect to the server
        client = get_client();
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('check connect to gRPC server', async () => {
        try {
            await promisify(client.waitForReady).call(client, Date.now() + 10000);
            expect(true).toBe(true);
        } catch (error) {
            console.error('Error connecting to gRPC server', error);
            expect(error).toBeFalsy();
        }
    });

});