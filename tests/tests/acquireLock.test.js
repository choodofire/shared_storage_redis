const { get_client } = require("../sharedStorageService/sharedStorageService");
const { acquireLock, releaseLock, pollLock } = require("../handlers/handlers");
const { gen_payload, sleeP, set_lifetime } = require("../helpers/helpers");

describe("acquireLock test", () => {
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
    // Create client to connect to the server
    client = get_client();
    req = gen_payload(template);
    req2_ticket1 = Object.assign({}, gen_payload(template), {ticket: req.ticket});
  });

  afterEach(() => {
    // Close server connection after each test
    try{
        client.close();
    }catch(_e){}
  });

  it("AcquireLock with ticket without lock", async () => {
    const acquireLockResponse = await acquireLock(req, client);
    expect(acquireLockResponse.isError).toBeFalsy();

    const pollLockResponse1 = await pollLock(req, client);
    expect(pollLockResponse1.isBlocked).toBeTruthy();

    const releaseLockResponse = await releaseLock(req, client);
    expect(releaseLockResponse.isError).toBeFalsy();

    const pollLockResponse2 = await pollLock(req, client);
    expect(pollLockResponse2.isBlocked).toBeFalsy();
  });

  it("AcquireLock with lifetime dead", async () => {
    const blocking_time_ms = 1000*8
    set_lifetime(req, blocking_time_ms)

    const acquireLockResponse = await acquireLock(req, client);
    expect(acquireLockResponse.isError).toBeFalsy();

    const pollLockResponse1 = await pollLock(req, client);
    expect(pollLockResponse1.isBlocked).toBeTruthy();

    await sleeP(blocking_time_ms * 0.5)

    const pollLockResponse2 = await pollLock(req, client);
    expect(pollLockResponse2.isBlocked).toBeTruthy();

    await sleeP(blocking_time_ms * 0.75)

    const pollLockResponse3 = await pollLock(req, client);
    expect(pollLockResponse3.isBlocked).toBeFalsy();
  });

  it("AcquireLock with ticket with lock", async () => {
    const acquireLockResponse1 = await acquireLock(req, client);
    expect(acquireLockResponse1.isError).toBeFalsy();

    const pollLockResponse1 = await pollLock(req, client);
    expect(pollLockResponse1.isBlocked).toBeTruthy();

    const acquireLockResponse2 = await acquireLock(req, client);
    expect(acquireLockResponse2.isError).toBeTruthy();

    const pollLockResponse2 = await pollLock(req, client);
    expect(pollLockResponse2.isBlocked).toBeTruthy();

    const releaseLockResponse2 = await releaseLock(req, client);
    expect(releaseLockResponse2.isError).toBeFalsy();

    const pollLockResponse3 = await pollLock(req, client);
    expect(pollLockResponse3.isBlocked).toBeFalsy();
  });

  it("AcquireLock with ticket with lock with lifetime dead", async () => {
    let blocking_time_ms = 1000*5;
    set_lifetime(req, blocking_time_ms);

    const acquireLockResponse1 = await acquireLock(req, client);
    expect(acquireLockResponse1.isError).toBeFalsy();

    const pollLockResponse1 = await pollLock(req, client);
    expect(pollLockResponse1.isBlocked).toBeTruthy();

    blocking_time_ms *= 2;
    set_lifetime(req, blocking_time_ms);

    const acquireLockResponse2 = await acquireLock(req, client);
    expect(acquireLockResponse2.isError).toBeTruthy();

    const pollLockResponse2 = await pollLock(req, client);
    expect(pollLockResponse2.isBlocked).toBeTruthy();

    await sleeP(blocking_time_ms * 0.4)

    const pollLockResponse3 = await pollLock(req, client);
    expect(pollLockResponse3.isBlocked).toBeTruthy();

    await sleeP(blocking_time_ms * 0.4)

    const pollLockResponse4 = await pollLock(req, client);
    expect(pollLockResponse4.isBlocked).toBeFalsy();
  });
});
