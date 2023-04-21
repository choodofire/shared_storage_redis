const uuid = require("uuid");

module.exports = gen_payload = (template = {}) => {
    return Object.assign({}, template, {
        owner: uuid.v4(),
        ticket: uuid.v4(),
    });
}