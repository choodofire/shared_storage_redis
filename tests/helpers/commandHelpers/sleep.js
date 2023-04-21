module.exports = sleeP = (t_ms) => {
    return new Promise((res) => {
        setTimeout(() => res(), t_ms);
    })
}