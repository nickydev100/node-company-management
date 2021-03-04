'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * User Schema
 */

var model;

var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		required: "Please provide firstName"
	},
	middleName: {
		type: String,
		trim: true,
		default: '',
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
	},
	displayName: {
		type: String,
		trim: true,
		default: ''
	},
	email: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	mobile: {
		dialCode: {
			type: String
		},
		phoneNumber: {
			type: String
		}
	},
	altMobile: {
		dialCode: {
			type: String
		},
		phoneNumber: {
			type: String
		}
	},
	costPerHour: {
		currencyCode: {
			type: String
		},
		value: {
			type: Number
		}
	},
	cpr: {
		type: String
	},
	gender: {
		type: String,
		enum: ['male', 'female']
	},
	address1: {
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
		postalCode: {
			type: String
		},
		countryCode: {
			type: String
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
				default: [0, 0]
			}
		}
	},
	address2: {
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
		postalCode: {
			type: String
		},
		countryCode: {
			type: String
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
				default: [0, 0]
			}
		}
	},
	profilePic: {
		type: String,
		default: "https://res.cloudinary.com/dktnhmsjx/image/upload/v1486128885/default/roofer.png"
	},
	dateOfBirth: {
		type: String
	},
	dateOfJoin: {
		type: String
	},
	dateOfLeave: {
		type: String
	},
	webToken: {
		type: String
	},
	mobileToken: {
		type: String
	},
	password: {
		type: String,
	},
	salt: {
		type: String
	},
	provider: {
		type: String
	},
	designation: {
		type: String,
		required: "designation not provided",
		enum: ['admin', 'manager', 'roofer']
	},
	providerData: {},
	authorizationCode: {
		type: Number
	},
	companyId: {
		type: String,
		required: "Company id required"
	},
	projects: {
		type: [{
			project_id: String
		}]
	},
	isActive: {
		type: Boolean,
		default : true
	},
	additionalProvidersData: {},
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

UserSchema.pre("save", function (next) {
	console.log("saving user")
	let self = this;
	if (!self.displayName) {
		self.displayName = self.firstName + " " + self.lastName;
	}

	if (!self.mobile && !self.email)
		return next(new Error("Please provide email and mobile"))

	if (self.designation === 'roofer') {
		model.findOne({ mobile: self.mobile }, 'mobile', function (err, result) {
			if (err) {
				return next(err);
			}
			else if (result) {
				return next(new Error("Mobile already exist"));
			}

			self.authorizationCode = 8;
			return next();
		})
	}

	model.findOne({ email: self.email }, 'email', function (err, result) {
		if (err) {
			return next(err);
		}
		else if (result) {
			return next(new Error("Cannot use this Email"));
		}

		model.findOne({ mobile: self.mobile }, 'mobile', (err, user) => {
			if (err)
				return next(err);
			else if (result)
				return next(new Error("This mobile is already taken"));
			if (self.password && self.isModified('password')) {
				self.salt = crypto.randomBytes(16).toString('base64');
				self.password = self.hashPassword(self.password);
			}
			switch (self.designation) {
				case 'admin':
					self.authorizationCode = 14;
					break;
				case 'manager':
					self.authorizationCode = 12;
					break;
				default:
					self.authorizationCode = 8;
					break;
			}
			next();
		})
	})
});

UserSchema.pre("update", (next) => {
	let self = this;
	console.log("IN PRE UPDATE",self)
	if (self.password) { }
	next();
})

UserSchema.methods.getSaltAndPassword = function(newPassword){
	let salt = crypto.randomBytes(16).toString('base64');
	let password = crypto.pbkdf2Sync(newPassword, new Buffer(salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
	return {salt : salt, password : password};
}

UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
	} else {
		return password;
	}
};


UserSchema.methods.authenticate = function (password) {
	return (this.password === this.hashPassword(password) && this.isActive);
};

UserSchema.methods.isSuperAdmin = function () {
	return this.authorizationCode === 15 ? true : false;
}


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


module.exports = model = mongoose.model('User', UserSchema);