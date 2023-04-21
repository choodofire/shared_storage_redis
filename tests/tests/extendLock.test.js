const { get_client } = require('../sharedStorageService/sharedStorageService');
const { releaseLock, pollLock, acquireLock, extendLock} = require('../handlers/handlers');
const { gen_payload, sleeP, set_lifetime } = require("../helpers/helpers");

describe('extendLock test', () => {
    let client;
    let req1;
    let req2;
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
        req2 = gen_payload(template);
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('extendLock with empty ticket', async () => {
        const extendLockResponse = await extendLock(req1, client);
        expect(extendLockResponse.isError).toBeTruthy();

        const pollLockResponse = await pollLock(req1, client);
        expect(pollLockResponse.isBlocked).toBeFalsy();
    });

    it('extendLock with locked ticket with same owner', async () => {
        const acquireLockResponse = await acquireLock(req1, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req1, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        const extendLockResponse = await extendLock(req1, client);
        expect(extendLockResponse.isError).toBeDefined();
        expect(extendLockResponse.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req1, client);
        expect(pollLockResponse2.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req1, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponse3 = await pollLock(req1, client);
        expect(pollLockResponse3.isBlocked).toBeFalsy();
    });

    it('extendLock with locked ticket with different owners', async () => {
        const acquireLockResponse = await acquireLock(req1, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req1, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        const extendLockResponse = await extendLock(req2, client);
        expect(extendLockResponse.isError).toBeTruthy();

        const releaseLockResponse = await releaseLock(req1, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req1, client);
        expect(pollLockResponse2.isBlocked).toBeFalsy();
    });

    it('extendLock with locked ticket with same owner with lifetime dead', async () => {
        let blocking_time_ms = 1000*5
        set_lifetime(req1, blocking_time_ms)

        const acquireLockResponse = await acquireLock(req1, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req1, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        blocking_time_ms = 1000*10
        set_lifetime(req1, blocking_time_ms)

        const extendLockResponse = await extendLock(req1, client);
        expect(extendLockResponse.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req1, client);
        expect(pollLockResponse2.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.5)

        const pollLockResponse3 = await pollLock(req1, client);
        expect(pollLockResponse3.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.7)

        const pollLockResponse4 = await pollLock(req1, client);
        expect(pollLockResponse4.isBlocked).toBeFalsy();
    });
});