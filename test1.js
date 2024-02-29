// Assume you have retrieved the user's timezone (e.g., "America/New_York")
const moment = require('moment-timezone')
const userTimezone = "Asia/Jakarta";

const currentDate = moment(new Date()).tz(userTimezone).format('DD-MM-YYYY HH:mm:ss')
console.log(currentDate)