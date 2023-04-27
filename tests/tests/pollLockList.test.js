const { get_client } = require('../sharedStorageService/sharedStorageService');
const { releaseLock, pollLock, acquireLock, pollLockList} = require('../handlers/handlers');
const { gen_payload_array} = require("../helpers/helpers")

describe('pollLockList test', () => {
    let client;
    let req;
    const PAYLOAD_ARRAY_LENGTH = 5;
    const MIN_LIFETIME_MS = 5000;
    const template = {
        owner: "owner",
        ticket: "ticket",
        lifetime: MIN_LIFETIME_MS,
    };

    beforeEach(() => {
        // Create a client to connect to the server
        client = get_client();
        req = gen_payload_array(template, PAYLOAD_ARRAY_LENGTH);
    });

    afterEach(() => {
        // Close the server connection after each test
        try{
            client.close();
        }catch(_e){}
    });

    it('pollLockList with empty tickets', async () => {
        const pollLockListResponse = await pollLockList(req, client);
        pollLockListResponse.responses.forEach((response) => {
            expect(response.isBlocked).toBeFalsy();
        });
    });

    it('pollLockList with locked ticket', async () => {
        const acquire_number = 0;
        const req_acquire = req.requests[acquire_number];

        const acquireLockResponse = await acquireLock(req_acquire, client);
        expect(acquireLockResponse.isError).toBeFalsy();

        const pollLockListResponse1 = await pollLockList(req, client);
        pollLockListResponse1.responses.forEach((response, index) => {
            +index === +acquire_number ?
                expect(response.isBlocked).toBeTruthy() : expect(response.isBlocked).toBeFalsy();
        });

        const releaseLockResponse = await releaseLock(req_acquire, client);
        expect(releaseLockResponse.isError).toBeFalsy();

        const pollLockListResponse2 = await pollLockList(req, client);
        pollLockListResponse2.responses.forEach((response) => {
            expect(response.isBlocked).toBeFalsy();
        });
    });
});