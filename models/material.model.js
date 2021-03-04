'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Material Schema
 */

var MaterialSchema = new Schema({
	
    name : {
        type : String,
        required : true
    },
    companyId : {
        type : String,
        required : true
    },
    unit : {
        type : String,
        enum : ['mt','sq.mt','ft','sq.ft','inch','sq.inch'],
        required : true
    },
    materialCost : {
        currencyCode : {
            type : String
        },
        value : {
            type : Number
        }
    },
    rooferCost : {
        currencyCode : {
            type : String
        },
        value : {
            type : Number
        }
    },
    systemTag : {
        type : String,
        required : true
    },
	providerData: {},
	isActive : {
			type : Boolean,
			default : true
		},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});

/**
 * Hook a pre save method
 */

MaterialSchema.pre("save", (next) => {

	console.log(this)
	next();
});


/**
 * Hook validations for saving data
 */
let validateName = (name) => {
    //check for invalid names
    return /^[a-zA-Z ]{3,}$/.test(name)
}



module.exports = mongoose.model('Material', MaterialSchema);