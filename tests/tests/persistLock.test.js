const { get_client } = require('../sharedStorageService/sharedStorageService');
const { persistLock, releaseLock, pollLock} = require('../handlers/handlers');
const { gen_payload } = require("../helpers/helpers")

describe('persistLock test', () => {
    let client;
    let req1;
    const MIN_LIFETIME_MS = 5000;
    const template = {
        owner: "owner",
        ticket: "ticket",
        lifetime: MIN_LIFETIME_MS,
    };

    beforeEach(() => {
        // Create a client to connect to the server
        client = get_client();
        req1 = gen_payload(template);
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('persistLock with ticket without lock', async () => {
        const persistLockResponse = await persistLock(req1, client);
        expect(persistLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req1, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req1, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req1, client);
        expect(pollLockResponse2.isBlocked).toBeFalsy();
    });

    it('persistLock with ticket with lock', async () => {
        const persistLockResponse = await persistLock(req1, client);
        expect(persistLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req1, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        const persistLockResponse2 = await persistLock(req1, client);
        expect(persistLockResponse2.isError).toBeTruthy();

        const pollLockResponse2 = await pollLock(req1, client);
        expect(pollLockResponse2.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req1, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponse3 = await pollLock(req1, client);
        expect(pollLockResponse3.isBlocked).toBeFalsy();
    });
});