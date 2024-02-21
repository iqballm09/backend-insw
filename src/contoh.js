const moment1 = require('moment-timezone')

const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone

console.log(moment1.utc())