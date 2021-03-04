'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Company Schema
 */

var CompanySchema = new Schema({
	companyName: {
		type: String,
		trim: true,
		default: ''
	},
	description : {
		type : String,
		default : ''
	},
	yearFounded : {
		type : String,
		trim : true,
		default : ''
	},
	companyWebsite : {
		type : String,
		default : ''
	},
	industry	:	{
		type : [{
			type : String
		}]
	},
	companyContact: {
		dialCode : {
			type : String
		},
		phoneNumber: {
			type : String
		}
	},
	email : {
		type : String
	},
	rateAnalysis : {
		type : [{
			combo : [{
				materialId : {
					type : String
				},
				materialName : {
					type : String
				},
				systemTag : {
					type : String
				},
				quantity : {
					type : Number
				},
				materialCost : {
					currencyCode : {
            			type : String
        			},
        			value : {
            			type : Number
        			}
				},
				materialTotalCost : {
					currencyCode : {
            			type : String
        			},
        			value : {
            			type : Number
        			}
				},
				rooferTotalCost : {
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
				wastePercent : {
					type : Number
				},
				conversionFactor : {
					type : Number
				}				
			}],
			totals : {
				category : {
					type : String
				},
				name : {
					type : String
				},
				description: {
					type : String
				},
				uom : {
					type : String
				},
				unitSymbol : {
					type : String
				},
				rooferTotal : {
					currencyCode : {
            			type : String
        			},
        			value : {
            			type : Number
        			}
				},
				materialTotal : {
					currencyCode : {
            			type : String
        			},
        			value : {
            			type : Number
        			}
				}
			}
		}]
	},
	address1 : {
		line1 : {
			type : String
		},
		line2 : {
			type : String	
		},
		line3 : {
			type : String	
		},
		city  : {
			type : String	
		},
		postalCode : {
			type : String	
		},
		countryCode : {
			type : String
		},
		loc: { 
			'type': {
				type: String,
				enum: "Point", 
				default: "Point"
			},
			coordinates: 
			{ 
				type: [Number],
				default: [0,0]
			} 
		}
	},
	address2 : {
		line1 : {
			type : String
		},
		line2 : {
			type : String	
		},
		line3 : {
			type : String	
		},
		city  : {
			type : String	
		},
		postalCode : {
			type : String	
		},
		countryCode : {
			type : String
		},
		loc: { 
			'type': {
				type: String,
				enum: "Point", 
				default: "Point"
			},
			coordinates: 
			{ 
				type: [Number],
				default: [0,0]
			} 
		}
	},
	annualRevenue : {
		currencyCode : {
			type : String
		},
		value : {
			type : String
		}
	},
	linkedinPage : {
		type : String
	},
	twitterHandle : {
		type : String
	},
	facebookPage : {
		type : String
	},
    companyAdmin : {
        type : String
    },
	companyManagers : {
		type : [{
			type : String
		}]
	},
	companyRoofers : {
		type : [{
			type : String
		}]
	},
	companyLogo : {
		type : String,
		default : "https://res.cloudinary.com/dktnhmsjx/image/upload/v1486129234/default/company.png"
	},
	provider: {
		type: String,
	},
	providerData: {},
	projects : {
		type : [{
			project_id : {
				type : Schema.Types.ObjectId, ref : 'Project'
			}
		}]
	},
	isActive : {
			type : Boolean,
			default : true
		},
	additionalProvidersData: {},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	clients : {
		type : [{
				type : String
		}]
	},
	materials : {
		type : [{
			type : String
		}]
	},
	holidays : {
		type : [{
				type : String
		}]
	}
});

/**
 * Hook a pre save method
 */

CompanySchema.pre("save", (next) => {

	console.log("saving Company")
	next();
});

CompanySchema.pre("update", (next) => {

	console.log("updating Company")
	next();
});


/**
 * Hook validations for saving data
 */
let validateName = (name) => {
    //check for invalid names
    return /^[a-zA-Z ]{3,}$/.test(name)
}

module.exports = mongoose.model('Company', CompanySchema);