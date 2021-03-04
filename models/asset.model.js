'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Material Schema
 */

var AssetSchema = new Schema({
	
    companyId : {
        type : String
    },
    projectId : {
        type : String
    },
    assetName : {
        type : String,
        default : "untitled"
    },
    assetDescription : {
        type : String,
        default : "not provided"
    },
    originalname : {
        type : String
    },
    version : {
        type : String
    },
    resource_type : {
        type : String
    },
    etag : {
        type : String
    },
    mimetype : {
        type : String
    },
    encoding : {
        type : String
    },
    width : {
        type : String
    },
    height :  {
        type : String
    },
    format : {
        type : String
    },
    bytes : {
        type : String
    },
    url : {
        type : String
    },
    secure_url : {
        type : String
    },
    pages : {
        type : Number,
        default : 1
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

AssetSchema.pre("save", (next) => {

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



module.exports = mongoose.model('Asset', AssetSchema);