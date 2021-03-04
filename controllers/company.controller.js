const Company = require('../models/company.model');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const companyAdmin = require('../models/companyAdmin.model');
const crypto = require('crypto');
const mailer = require('./sendGrid.controller');
const jwt = require('jsonwebtoken');
const __ = require('../helper/globals');

module.exports = {

    createCompany: (req, res) => {
        //create a company (super admin)
        let data = req.body;
        data.providerData = {};
        data.providerData.addedBy = {
            _id: req.user['_id'],
            email: req.user['email'],
            name: req.user['firstName'] + " " + req.user['lastName']
        };
        Company(req.body).save((err, company) => {
            if (company)
                return res.json(company);
            else
                return res.json(err);
        })
    },

    listAllCompany: (req, res) => {
        //list all employees in company (super admin)
        //TODO : pagination
        let chunk = null,
            page = null;
        if (req.query.chunk && req.query.page) {
            chunk = parseInt(req.query.chunk);
            page = parseInt(req.query.page);
        }
        let search = "";
        let regex = null;
        if (req.query.search) {
            regex = new RegExp(req.query.search, 'gi');
        } else {
            regex = new RegExp();
        }
        let s = (page - 1) * chunk;
        Company.find({
                $or: [{
                        'companyName': regex
                    },
                    {
                        'email': regex
                    },
                    {
                        'address1.line1': regex
                    },
                    {
                        'address1.line2': regex
                    },
                    {
                        'address1.line3': regex
                    },
                    {
                        'address1.city': regex
                    }
                ]
            })
            .sort({
                isActive: 1,
                companyName: 1
            })
            .skip(s)
            .limit(chunk)
            .exec((err, list) => {
                if (list)
                    return res.status(200).json(list)
                else {
                    return res.status(500).json({
                        errorTag: 100,
                        message: "couldn't fetch from database",
                        server: err
                    })
                }
            })
    },

    getEmployeeById: (req, res) => {
        if (req.params.emp_id) {
            User.findById(req.params.emp_id, (err, emp) => {
                if (emp) {
                    //remove sensitive data
                    emp.password = emp.salt = emp.created = emp.updated = undefined;
                    emp.webToken = emp.mobileToken = emp.authorizationCode = undefined;
                    if (emp.companyId == req.user.companyId || req.user.authorizationCode == 15)
                        return res.json(emp)
                    else
                        return res.json({
                            errorTag: 106,
                            message: "You can not access this data"
                        })
                } else {
                    return res.json({
                        error: 200,
                        message: "no params found"
                    })
                }
            })
        } else {
            return res.status(400).json({
                errorTag: 101,
                message: "no params found"
            })
        }
    },

    getCompanyById: (req, res) => {
        if (req.params.cmp_id)
            Company.findById(req.params.cmp_id, (err, company) => {
                if (err) {
                    return res.json({
                        errorTag: 100,
                        message: err
                    });
                }
                if (company == null) {
                    return res.status(404).json({
                        errorTag: 101,
                        message: "no Company found"
                    })
                } else {
                    Project.count({
                        companyId: req.params.cmp_id
                    }, (err, count) => {
                        company = company.toObject();
                        if (count)
                            company.projectCount = count;
                        else
                            company.projectCount = 0;

                        return res.json(company);
                    })
                }
            })
        else {
            return res.status(400).json({
                errorTag: 101,
                message: "no params found"
            })
        }
    },

    updateCompanyById: (req, res) => {
        //update 1 employee using _id
        let data = req.body;
        let cmp_id = req.params.cmp_id;
        data.providerData = {};
        data.providerData.updatedBy = {
            _id: req.user['_id'],
            email: req.user['email'],
            name: req.user['firstName'] + " " + req.user['lastName']
        };
        if (cmp_id) {
            Company.findOneAndUpdate({
                _id: cmp_id
            }, data, (err, result) => {
                if (result) {
                    return res.json(result)
                } else
                    return res.status(500).json({
                        errorTag: 100,
                        message: err.message
                    });
            })
        } else {
            return res.status(400).json({
                errorTag: 101,
                message: "INVALID REQUEST"
            })
        }
    },

    createCompanyAdmin: (req, res) => {
        //(super admin)
        let admin = req.body;
        admin.designation = 'admin';
        admin.companyId = req.params.cmp_id;

        if (req.params.cmp_id) {
            Company.findById(req.params.cmp_id, (err, company) => {
                console.log(company, err)
                if (company) {
                    if (company.companyAdmin)
                        return res.json({
                            error: 400,
                            message: "Admin for this company already exist"
                        })
                    else {
                        let pass = crypto.randomBytes(6).toString('base64');
                        admin.password = pass;

                        User(admin).save((err, user) => {
                            console.log("USER", user);
                            if (user) {
                                let token = jwt.sign({
                                    _id: user._id
                                }, __.secret, {
                                    expiresIn: '10h'
                                });
                                let mailData = {
                                    name: user.firstName,
                                    email: user.email,
                                    link: `https://cloudes-company-staging.firebaseapp.com/set_password?token=${token}`,
                                    logo: company.companyLogo
                                };
                                //send mail
                                mailer.welcomeMail(mailData);
                                Company.update({
                                        _id: req.params.cmp_id
                                    }, {
                                        companyAdmin: user._id
                                    },
                                    (err, company) => {
                                        if (company)
                                            return res.json(company)
                                        else
                                            return res.status(500).json({
                                                errorTag: 100,
                                                message: "DB operation failed"
                                            })
                                    })
                            } else
                                return res.status(400).json({
                                    errorTag: 100,
                                    message: err.message
                                });
                        })
                    }
                } else {
                    return res.status(403).json(err)
                }
            })
        } else {
            return res.status(400).json({
                errorTag: 101,
                message: "No params found"
            })
        }
    },

    updateCompanyAdminById: (req, res) => {
        //update admin details of a company (super admin)
        let adm = req.params.adm_id
        let newAdmin = req.body;
        if (!newAdmin)
            return res.status(403).json({
                errorTag: 102,
                message: "no admin data found in REQUEST"
            })
        User.findByIdAndUpdate(adm, newAdmin, (err, result) => {
            if (result)
                return res.json(result)
            else
                return res.status(500).json({
                    errorTag: 100,
                    message: "DB operation failed",
                    extra: err.message
                })
        })
    },

    createManager: (req, res) => {
        //create a manager in company (company admin)
        User.findOne({
            email: req.body.email
        }, function (err, doesUserExist) {
            if (doesUserExist) {
                return res.status(400).json({
                    errorTag: 102,
                    message: "Email already registered"
                })
            } else {
                let admin = req.user;
                let manager = req.body;
                manager.designation = 'manager';
                manager.companyId = admin.companyId;
                manager.providerData = {
                    addedBy: {
                        _id: admin._id,
                        name: admin.firstName + " " + admin.lastName
                    }
                }
                new User(manager).save((err, user) => {
                    if (user) {
                        Company.findByIdAndUpdate(admin.companyId, {
                                $push: {
                                    "companyManagers": user._id
                                }
                            }, {
                                safe: true,
                                upsert: true,
                                new: true
                            }, {
                                $set: {
                                    updated: Date.now()
                                }
                            },
                            (err, result) => {
                                if (result) {
                                    let token = jwt.sign({
                                        _id: user._id
                                    }, __.secret, {
                                        expiresIn: '10h'
                                    });

                                    let mailData = {
                                        name: user.firstName + ' ' + user.lastName,
                                        email: user.email,
                                        link: `https://cloudes-company-staging.firebaseapp.com/set_password?token=${token}`
                                    };
                                    //send mail
                                    mailer.welcomeMail(mailData);
                                    return res.json(result)
                                } else {
                                    return res.status(500).json({
                                        error: 500,
                                        message: err.message
                                    })
                                }
                            })
                    } else {
                        return res.status(403).json({
                            error: 403,
                            message: err.message
                        })
                    }
                })
            }
        })
    },

    updateManager: (req, res) => {
        let admin = req.user;
        let manager_id = req.params.manager_id;
        let manager = req.body;
        manager.updated = Date.now();
        if (manager_id) {
            User.findOneAndUpdate({
                _id: manager_id
            }, manager, (err, result) => {
                if (result) {
                    return res.json(result)
                } else
                    return res.json({
                        error: 500,
                        message: err.message
                    });
            })
        } else {
            return res.json({
                error: 403,
                message: "INVALID REQUEST"
            })
        }

    },

    createRoofer: (req, res) => {
        let admin = req.user;
        let roofer = req.body;
        roofer.designation = 'roofer';
        roofer.companyId = admin.companyId;
        roofer.password = null;
        roofer.providerData = {
            addedBy: {
                _id: admin._id,
                name: admin.firstName + " " + admin.lastName
            }
        }
        User(roofer).save((err, user) => {
            if (user) {
                Company.findByIdAndUpdate(admin.companyId, {
                        $push: {
                            "companyRoofers": user._id
                        },
                        safe: true,
                        upsert: true,
                        new: true,
                        $set: {
                            updated: Date.now()
                        }
                    },
                    (err, result) => {
                        if (result)
                            return res.json(result)
                        else
                            return res.status(500).json({
                                error: 500,
                                message: err.message
                            })
                    })
            } else {
                return res.status(403).json({
                    error: 403,
                    message: err.message
                })
            }
        })
    },

    updateRoofer: (req, res) => {
        let updater = req.user;
        let roofer_id = req.params.roofer_id;
        let roofer = req.body;
        roofer.updated = Date.now();
        roofer.providerData = {};
        roofer.providerData.lastUpdatedBy = {
            _id: updater._id,
            name: updater.displayName
        };
        if (roofer_id) {
            if(roofer.email) {
                User.findOne({email : req.body.email.trim()} , (err , data) => {
                    if(err) {
                        return res.json({
                            error: 500,
                            message: err.message
                        });
                    } else {
                        if(data !== null) {
                            return res.status(400).json({
                                error : 400,
                                message : 'Email already exists'
                            })
                        }
                        else {
                            User.findOneAndUpdate({
                                _id: roofer_id
                            }, roofer, (err, result) => {
                                if (result) {
                                    return res.json(result)
                                } else
                                    return res.json({
                                        error: 500,
                                        message: err.message
                                    });
                            })
                        }
                    }
                })
            }
            
        } else {
            return res.json({
                error: 403,
                message: "INVALID REQUEST"
            })
        }
    },

    updateCompanyLogo: (req, res) => {
        let file = req.file;
        if (file) {
            Company.findByIdAndUpdate({
                    _id: req.user.companyId
                }, {
                    $set: {
                        companyLogo: file.secure_url
                    }
                }, {
                    $set: {
                        updated: Date.now()
                    }
                },
                (err, result) => {
                    if (result)
                        return res.json(result);
                    else
                        return res.json(err);
                })
        } else {
            return res.status(500).json({
                error: 500,
                message: "couldnt upload"
            })
        }
    },

    bulkInsertRoofers: (req, res) => {
        if (!req.user.companyId) {
            return res.json({
                error: "Super Admin Can't do that"
            })
        }
        let rooferList = req.body;
        var admin = req.user;
        rooferList.map((roofer) => {
            roofer.designation = 'roofer';
            roofer.companyId = admin.companyId;
            roofer.password = null;
            roofer.providerData = {
                addedBy: {
                    _id: admin._id,
                    name: admin.firstName + " " + admin.lastName
                }
            }
        })
        var reported = 0;
        let report = () => {
            reported = reported + 1;
            if (reported == rooferList.length)
                return res.send(reported + ' added');
        }
        rooferList.forEach(function (roofer) {
            User(roofer).save((err, user) => {
                if (user) {
                    Company.findByIdAndUpdate(admin.companyId, {
                            $push: {
                                "companyRoofers": user._id
                            },
                            $set: {
                                updated: Date.now()
                            }
                        }, {
                            safe: true,
                            upsert: true,
                            new: true
                        },
                        (err, result) => {
                            if (result) {
                                report();
                            } else
                                return res.status(500).json({
                                    error: 500,
                                    message: err.message
                                })
                        })
                } else {
                    return res.status(403).json({
                        error: 403,
                        message: err.message
                    })
                }
            })
        })
    },

    toggleCompanyIsActiveById: (req, res) => {
        let c_id = req.params.c_id;
        Company.findById(c_id, (err, company) => {
            if (company) {
                Company.findByIdAndUpdate(c_id, {
                    $set: {
                        isActive: !company.isActive,
                        updated: Date.now()
                    },
                }, (err, newCompany) => {
                    return res.json(newCompany);
                })
            } else
                return res.json({
                    message: "company not found"
                })
        })
    },


    /**Registratioon of a company. */
    registerCompany: (req, res) => {
        //register a company
        console.log("rrrrrr");
        let data = req.body;
        console.log("in registration company");
        console.log(data);
        Company(req.body).save((err, company) => {
            if (company){
                var uuid = guid();
                var referenceData = {
                    companyId : company._id,
                    generatedUuid : uuid
                }
               companyAdmin(referenceData).save((err,compadmindata) =>{
                   if(compadmindata){
                    //sending mail on company provided E-mail Id.

                      let mailData = {
                        name: company.companyName,
                        email: company.email,
                        id: compadmindata.generatedUuid,
                        link: `${__.baseUrl()}`,
                   // logo: result.companyLogo
                 };
                    console.log(mailData);
                    //send mail
                    mailer.sendAdminFormLinkToCompany(mailData);
                    return res.json(company);
                   }
                   else {
                    return res.json(err);    
                   }
               });
                // //sending mail on company provided E-mail Id.

                // let mailData = {
                //         name: company.companyName,
                //         email: company.email,
                //         id: company._id,
                //         link: `${__.baseUrl()}`,
                //        // logo: result.companyLogo
                //      };
                //         console.log(mailData);
                //         //send mail
                //         mailer.sendAdminFormLinkToCompany(mailData);
                //         return res.json(company);
            }
            else{
                return res.json(err);

            }
        })
    },

    registerCompanyAdmin:(req,res)=>{
        let admin = req.body;
        console.log(admin);
        admin.designation = 'admin';
        if (req.params.cmp_id) {
            companyAdmin.findOne({generatedUuid:req.params.cmp_id},(err, companyAdmin) =>{
                  if(companyAdmin){
                    console.log("companyAdmin data", companyAdmin);
                    var companyid = companyAdmin.companyId;
                    admin.companyId = companyid;

                    Company.findById(companyid,(err,company)=>{
                        if(company){
                            console.log("company found");
                            if(company.companyAdmin){
                                console.log("company admin already exists");
                                return res.status(107).json({
                                    errorTag: 100,
                                    message: "Admin for this company already exist."
                                })
                                
                            }
                            else {
                                console.log("in else of company.companyadmin");
                                let pass = crypto.randomBytes(6).toString('base64');
                                admin.password = pass;
        
                                User(admin).save((err, user) => {
                                    console.log("USER", user);
                                    if (user) {
                                        let token = jwt.sign({
                                            _id: user._id
                                        }, __.secret, {
                                            expiresIn: '10h'
                                        });
                                        let mailData = {
                                            name: user.firstName,
                                            email: user.email,
                                            link: `https://cloudes-company-staging.firebaseapp.com/set_password?token=${token}`,
                                            logo: company.companyLogo
                                        };
                                        //send mail
                                        mailer.welcomeMail(mailData);
                                        Company.update({
                                                _id: companyid
                                            }, {
                                                companyAdmin: user._id
                                            },
                                            (err, company) => {
                                                if (company){
                                                    /**make company admin isActive false */
                                                   // companyAdmin.isActive = false;
                                                   companyAdmin.remove();
                                                    return res.json(company)
                                                }
                                                else{
                                                    return res.status(500).json({
                                                        errorTag: 100,
                                                        message: "DB operation failed"
                                                    })
                                                }
                                                    
                                            })
                                    }
                                     else
                                        return res.status(400).json({
                                            errorTag: 100,
                                            message: err.message
                                        });
                                })
                            }
                        }
                        else
                        {
                            return res.status(500).json({
                                errorTag: 100,
                                message: "company not found"
                            })
                        }
                    })

                  }
                  else{
                        return res.status(500).json({
                        errorTag: 100,
                        message: "Requsted params data did not found"
                      })
                  }
            })
           
        }
        else{
            return res.status(500).json({
                errorTag: 100,
                message: "did not found params."
              })
        }
    },

   


}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
  
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }