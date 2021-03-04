const Client        = require('../models/client.model');
const Asset         = require('../models/asset.model');
const Company       = require('../models/company.model');
const Project       = require('../models/project.model');



module.exports = {

   createClient     : (req,res) => {
       let client = req.body;
       client.companyId = req.user.companyId;
       Client(client).save((err,obj) => {
           if(obj){
               return res.status(200).json(obj);
           }
           else{
               return res.status.json({error : true})
           }
       })
   },

   listAllClients    : (req,res) => {
        let chunk = null, page = null;
        if(req.query.chunk && req.query.page){
            chunk = parseInt(req.query.chunk);
            page = parseint(req.query.page);
        }
        let search = "";
        let regex = null;
        if(req.query.search){
            regex = new RegExp(req.query.search,'gi');
        }
        else{
            regex = new RegExp();
        }
        let s = (page - 1) * chunk;
        Client.find({$or : [
                {'clientName' : regex},
                {'email' : regex},
                {'address1.line1' : regex},
                {'address1.line2' : regex},
                {'address1.line3' : regex},
                {'address1.city' : regex}]})
                .where({companyId : req.user.companyId})
                .skip(s)
                .limit(chunk)
                .exec((err,list) => {
                    if(err){
                        return res.status(500).json({errorTag : 100, message : err.message})
                    }
                    Client.count({
                        companyId : req.user.companyId
                        },(err,count) => {
                            if(err){
                                 return res.status(500).json({errorTag : 100, message : err.message})
                            }
                            else{
                                return res.json({total : count,list : list})
                            }
                        })
                })       
   },
   getClientById    : (req,res) => {
       let id = req.params.cli_id;
       Client.findById(id, (err,doc) => {
           if(doc){
               Project.count({clientId : id},(err,count) => {
                   doc = doc.toObject();
                    if(count)
                        doc.projectCount = count;
                    else
                        doc.projectCount = 0;
                    console.log(doc);
                    return res.status(200).json(doc);
               })
           }
           else{
               return res.status(500).json({errorTag : 101, message : err.message})
           }
           
       })
   },

   updateClientById : (req,res) => {
       let id = req.params.cli_id;
       let data = req.body;
       Client.findByIdAndUpdate(id, data,(err,doc) => {
           if(doc){
               return res.status(200).json(doc);
           }
           else{
               return res.status(500).json({error : 500})
           }
           
       })
   },

   createBulkClient : (req,res) => {
        if(!req.user.companyId){
            return res.json({error : "this user can't do that"})
        }
        let clientList = req.body;
        var admin = req.user;
        clientList.map((clientData) => {
            clientData.companyId = admin.companyId;
            clientData.providerData = {addedBy : {_id : admin._id, name : admin.firstName + " " + admin.lastName}}
        })
        var reported = 0;
        let report = () => {
            reported = reported + 1;
            if(reported == clientList.length)
                return res.send(reported + ' added');
        }
        clientList.forEach(function(clientData){
            Client(clientData).save((err,client) => {
                if(client){
                    Company.findByIdAndUpdate(admin.companyId,
                        {$push : {"clients" : client._id},$set : { updated : Date.now()}},
                        {safe : true, upsert : true, new : true},
                        (err, result) => {
                            if(result){
                                report();
                            }
                            else
                                return res.status(500).json({errorTag : 100 , message : err.message})    
                    })
                }
                else{
                    return res.status(500).json({errorTag : 100 , message : err.message})                
                }
            })
        })
   },

   deleteClientById : (req,res) => {
       let cli_id = req.params.cli_id;
       Client.findByIdAndRemove(cli_id,(err) => {
           if(err){
               return res.status(500).json({errorTag : 100, message : err.message});
           }
           Company.findByIdAndUpdate(req.user.companyId, {$pull : {clients : cli_id}}, (err,obj) => {
                if(obj)
                    return res.json(obj)
                else
                    return res.status(500).json({errorTag : 100, message : err.message})    
           });
       })
   },
   
   updateClientLogo : (req,res) => {
       let file = req.file;
       let clientId = req.params.cli_id;
        if(file){
            Client.findByIdAndUpdate(
                clientId,
                {$set : {clientLogo : file.secure_url}},
                {$set : { updated : Date.now()}},
                (err,result) => {
                if(result)
                    return res.json(result);
                else
                    return res.status(500).json({error : 500, message : "couldnt find client"})   
            }) 
        }
        else{
                return res.status(500).json({error : 500, message : "couldnt upload"})
        }
   },

}