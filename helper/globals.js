require('dotenv');
const os = require('os'),
    rng = require("randomstring"),
    _ = require('lodash');


module.exports = {
    /* for singing email tokens */
    secret: 'SomeRandomSecretForGeneratingJSONwebToken124111212122',
    randomChars: (length) => {
        return rng.generate(length);
    },
    baseUrl: () => {

        if (process.env.ENVIRONMENT === 'Development') {
            return 'https://cloudes-company-staging.firebaseapp.com';
        } else {            
           return 'http://localhost:8000';
        }

    },
    log: (data) => {
        if (process.env.ENVIRONMENT === 'Development') {
            return console.log(data);
        }
    }
    /* for checking required fields */
    // requiredFields : (req , fields) => {
    //     let bodyFields = Object.keys(req.body);
    // }
}