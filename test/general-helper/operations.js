const dateToday = () => {
    let dateNow = new Date().toISOString().slice(0, 10);
    return dateNow;
}

module.exports = {
    dateToday
}