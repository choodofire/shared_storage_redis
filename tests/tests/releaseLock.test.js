const { get_client } = require('../sharedStorageService/sharedStorageService');
const { releaseLock, pollLock, acquireLock} = require('../handlers/handlers');
const { gen_payload } = require("../helpers/helpers")

describe('releaseLock test', () => {
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

    it('releaseLock with empty ticket', async () => {
        const pollLockResponse1 = await pollLock(req, client);
        expect(pollLockResponse1.isBlocked).toBeFalsy();

        const releaseLockResponse = await releaseLock(req, client);
        expect(releaseLockResponse.isError).toBeTruthy();

        const pollLockResponse2 = await pollLock(req, client);
        expect(pollLockResponse2.isBlocked).toBeFalsy();
    });

    it('releaseLock with locked ticket with same owner', async () => {
        const acquireLockResponse = await acquireLock(req, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponseFirst = await pollLock(req, client);
        expect(pollLockResponseFirst.isBlocked).toBeTruthy();

        const releaseLockResponse = await releaseLock(req, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockResponseSecond = await pollLock(req, client);
        expect(pollLockResponseSecond.isBlocked).toBeFalsy();
    });

    it('releaseLock with locked ticket with different owners', async () => {
        const acquireLockResponse = await acquireLock(req, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockResponseFirst = await pollLock(req, client);
        expect(pollLockResponseFirst.isBlocked).toBeTruthy();

        const releaseLockResponseAnotherOwner = await releaseLock(req2_ticket1, client);
        expect(releaseLockResponseAnotherOwner.isError).toBeTruthy();

        const pollLockResponseSecond = await pollLock(req, client);
        expect(pollLockResponseSecond.isBlocked).toBeTruthy();

        const releaseLockResponseOwner = await releaseLock(req, client);
        expect(releaseLockResponseOwner.isError).toBeFalsy();

        const pollLockResponseThird = await pollLock(req, client);
        expect(pollLockResponseThird.isBlocked).toBeFalsy();
    });
});