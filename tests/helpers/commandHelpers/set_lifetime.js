module.exports = set_lifetime = (payload, ms) => {
    payload.lifetime = ms
    return payload
}