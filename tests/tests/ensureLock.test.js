const { get_client } = require('../sharedStorageService/sharedStorageService');
const { releaseLock, pollLock, ensureLock } = require('../handlers/handlers');
const { gen_payload, sleeP, set_lifetime } = require("../helpers/helpers")

describe('ensureLock test', () => {
    let client;
    let req;
    let req2_ticket1;
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
        req2_ticket1 = Object.assign({}, gen_payload(template), {ticket: req.ticket});
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('ensureLock with empty ticket', async () => {
        const ensureLockResponse = await ensureLock(req, client)
        expect(ensureLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req, client);
        expect(pollLockResponse2.isBlocked).toBeFalsy();
    });

    it('ensureLock with empty ticket with lifetime dead', async () => {
        let blocking_time_ms = 1000*6
        set_lifetime(req, blocking_time_ms)

        const ensureLockResponse = await ensureLock(req, client)
        expect(ensureLockResponse.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 1.2)

        const pollLockResponse2 = await pollLock(req, client);
        expect(pollLockResponse2.isBlocked).toBeFalsy();
    });

    it('ensureLock with locked ticket with same owner with lifetime dead', async () => {
        const ensureLockResponse1 = await ensureLock(req, client)
        expect(ensureLockResponse1.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        let blocking_time_ms = 1000*10
        set_lifetime(req, blocking_time_ms)

        const ensureLockResponse2 = await ensureLock(req, client)
        expect(ensureLockResponse2.isError).toBeFalsy();

        const pollLockResponse2 = await pollLock(req, client);
        expect(pollLockResponse2.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.6)

        const pollLockResponse3 = await pollLock(req, client);
        expect(pollLockResponse3.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.6)

        const pollLockResponse4 = await pollLock(req, client);
        expect(pollLockResponse4.isBlocked).toBeFalsy();
    });

    it('ensureLock with locked ticket with different owners with lifetime dead', async () => {
        let blocking_time_ms = 1000*5
        set_lifetime(req, blocking_time_ms)

        const ensureLockResponse1 = await ensureLock(req, client)
        expect(ensureLockResponse1.isError).toBeFalsy();

        const pollLockResponse1 = await pollLock(req, client);
        expect(pollLockResponse1.isBlocked).toBeTruthy();

        blocking_time_ms *= 2
        set_lifetime(req2_ticket1, blocking_time_ms)

        const ensureLockResponse2 = await ensureLock(req2_ticket1, client)
        expect(ensureLockResponse2.isError).toBeTruthy();

        const pollLockResponse2 = await pollLock(req2_ticket1, client);
        expect(pollLockResponse2.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.3)

        const pollLockResponse3 = await pollLock(req, client);
        expect(pollLockResponse3.isBlocked).toBeTruthy();

        await sleeP(blocking_time_ms * 0.4)

        const pollLockResponse4 = await pollLock(req, client);
        expect(pollLockResponse4.isBlocked).toBeFalsy();
    });
});