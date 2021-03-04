var moment = require('moment');
console.log(moment("2017-09-07T20:00:00.000Z").toDate())
console.log(moment("2017-09-07T20:00:00.000Z").startOf('date').toDate())
console.log(typeof new Date(moment("2017-09-07T20:00:00.000Z").endOf('date').toDate()))