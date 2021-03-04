'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * RooferTimeLog Schema
 */

var RooferTimeLogSchema = new Schema({

    minutes: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    from: {
        type: Date
    },
    to: {
        type: Date
    },
    companyId: {
        type: String
    },
    projectId: {
        type: String
    },
    rooferId : {
        type : String
    },
    timeBreakUp: {
        type: [{
            minutes : {
                type : Number
            },
            detail: {
                name: {
                    type: String
                },
                taskId: {
                    type: String
                },
                description: {
                    type: String
                }
            }
        }]
    },
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

RooferTimeLogSchema.pre("save", (next) => {
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



module.exports = mongoose.model('RooferTimeLog', RooferTimeLogSchema);