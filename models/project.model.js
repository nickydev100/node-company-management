'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Project Schema
 */

var ProjectSchema = new Schema({
	projectName: {
		type: String,
		required: "Please enter project name",
		default: ''
	},
	client: {},
	projectDescription: {
		type: String,
		default: ''
	},
	companyId: {
		type: String,
		required: "companyId not found"
	},
	projectImage: {
		type: String,
		default: "https://res.cloudinary.com/dktnhmsjx/image/upload/v1486129096/default/project.png"
	},
	startDate: {
		type: Date,
		required: "startDate not found"
	},
	endDate: {
		type: Date
	},
	isServiceProject: {
		type: Boolean,
		default: true
	},
	address: {
		line1: {
			type: String
		},
		line2: {
			type: String
		},
		line3: {
			type: String
		},
		city: {
			type: String
		},
		countryCode: {
			type: String
		},
		postalCode: {
			type: String
		},
		loc: {
			'type': {
				type: String,
				default: "Point"
			},
			coordinates:
			{
				type: [Number],
				default: [0, 0]
			}
		}
	},
	provider: {
		type: String,
	},
	projectFiles: {
		type: {
			roofPlans: {
				type: [{
					assetObj: {}
				}]
			},
			images: {
				type: [{
					assetObj: {},
				}]
			},
			others: {
				type: [{
					assetObj: {}
				}]
			}
		}
	},
	providerData: {},
	rooferAllotment: {},
	teamLeaderAllotment: {},
	projectStatus: {
		type: Number,
		default: 0
	},
	projectRAItems: {
		type: []
	},
	bill : {
		customItems : [],
		raItems : []
	},
	isActive: {
		type: Boolean,
		default: true
	},
	additionalProvidersData: {},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	weatherData : {}
});

/**
 * Hook a pre save method
 */

ProjectSchema.pre("save", (next) => {

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

let validateToken = (token) => {
	//validate token
	return true
}

ProjectSchema.index({ address: { loc: '2dsphere' } });
module.exports = mongoose.model('Project', ProjectSchema);