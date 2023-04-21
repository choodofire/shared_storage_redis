const { get_client } = require('../sharedStorageService/sharedStorageService');
const { releaseLock, pollLock, acquireLock} = require('../handlers/handlers');
const { gen_payload } = require("../helpers/helpers")

describe('pollLock test', () => {
    let client;
    let req;
    const MIN_LIFETIME_MS = 5000;
    const template = {
        owner: "owner",
        ticket: "ticket",
        lifetime: MIN_LIFETIME_MS,
    };

    beforeEach(() => {
        // Create a client to connect to the server
        client = get_client();
        req = gen_payload(template);
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('pollLock with empty ticket', async () => {
        const pollLockResponse = await pollLock(req, client);
        expect(pollLockResponse.isBlocked).toBeFalsy();
    });

    it('pollLock with locked ticket', async () => {
        const acquireLockResponse = await acquireLock(req, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponseFirst = await pollLock(req, client);
        expect(pollLockResponseFirst.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponseSecond = await pollLock(req, client);
        expect(pollLockResponseSecond.isBlocked).toBeFalsy();
    });
});