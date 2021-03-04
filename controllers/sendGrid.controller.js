require('dotenv');

const Company = require('../models/company.model');
const User = require('../models/user.model');
const Task = require('../models/task.model');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.sendGRID_API);
sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally



module.exports = {
    welcomeMail: (data, res) => {
        let mailData = {
            to: data.email,
            from: 'cloudsdevelopment@gmail.com',
            templateId: '23c16974-babd-45d9-97c3-22b07a500341',
            substitutions: {
                name: data.name,
                link : data.link,
            }
        };
        sgMail.send(mailData).then((data) => {
            console.log('Mail sent')   
        }).catch((e) => {
            console.log(e)
        });
    },
    // TODO: need to design a new template for this email ID
    resetPasswordBySuperAdmin: (data) => {
        let mailData = {
            to: data.email,
            from: 'cloudsdevelopment@gmail.com',
            templateId: '4f0228cf-d5e6-4c62-93b3-4bb07d77ff86',
            substitutions: {
                name: data.name,
                link : data.link,
            }
        };
        sgMail.send(mailData).then((data) => {
            console.log('Mail sent');
        }).catch((e) => {
            console.log(e)
        });
    },

    sendAppLinkToRoofer: (data) => {
        console.log(data);
    
        let mailData = {
            to : data.email,
            from : 'cloudsdevelopment@gmail.com',
            subject : 'Download app link.',
            templateId: '3641b34c-9647-4b69-9c69-c2732c129336',
            substitutions: {
                name: data.name,
                link : data.link,
            }
        };
        sgMail.send(mailData).then((data) => {
            console.log('Mail sent');
        }).catch((e) => {
            console.log("error", e);
        });
    },

    //send mail to registered companyId to add new admin for the company.
    sendAdminFormLinkToCompany : (data) => {
        let mailData = {
            to : data.email,
            from : 'cloudsdevelopment@gmail.com',
            templateId : 'de57b478-020f-4be6-b48b-cd3789cff2be',
            substitutions : {
                name : data.name,
                link : data.link,
                id : data.id
            }
        };
        sgMail.send(mailData).then((data) => {
            console.log("Mail sent on company Id");
        }).catch((e) => {
            console.log("error",e);
        });
    },

}