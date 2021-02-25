// get today's date
function getDate() {
    let todaysDate = new Date();
    let month = todaysDate.getMonth() + 1;
    let day = todaysDate.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    return `${todaysDate.getFullYear()}-${month}-${day}`;
}

export { getDate }