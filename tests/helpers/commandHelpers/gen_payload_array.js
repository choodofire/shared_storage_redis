const {gen_payload} = require("../helpers.js");

module.exports = gen_payload_array = (template = {},count = 1) => {
    const arr = [];

    for (let i = 0; i < count; i++) {
        arr.push(gen_payload(template));
    }

    return { requests:  arr };
}