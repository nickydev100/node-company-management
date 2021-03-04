const Material          = require('../models/material.model');
const Company             = require('../models/company.model');
const User             = require('../models/user.model');
const EntityTag = require('../models/entityTag.model');

module.exports = {

    createMaterial   : async (req,res) => {
        let material = req.body;
        material.companyId = req.user.companyId;
        /* Assign Entity tag */
        let existingEntityTag = await EntityTag.findOne({prefix : 'MATRL'});

        let currentEntityTag;
        if(!existingEntityTag) { /* first time check */
            let newTag = new EntityTag({
                prefix : 'MATRL',
                count : 1000
            });
            currentEntityTag = await newTag.save();
        } else {
            currentEntityTag = existingEntityTag;
        }
        currentEntityTag.count++;
        let updatedEntityTag = await currentEntityTag.save();
        updatedEntityTag = updatedEntityTag.toObject();

        material.systemTag = `${updatedEntityTag.prefix}${updatedEntityTag.count}`;

        /* Save material  */

        Material(material).save((err,mat) => {
            if(err){
                console.log(err);
                return res.status(500).json({err : 500, message : err.message});
            }
            else{
                return res.json(mat);
            }
        })
    },

    listAllMaterials : (req,res) => {
        let chunk = null, page = null;
        if(req.query.chunk && req.query.page){
            chunk = parseInt(req.query.chunk);
            page = parseInt(req.query.page);
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
        Material.find({'name' : regex})
                .where({companyId : req.user.companyId})
                .skip(s)
                .limit(chunk)
                .exec((err,list) => {
                    if(err){
                        return res.status(500).json({errorTag : 100, message : err.message})
                    }
                    Material.count({
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

    getMaterialById      :   (req,res) => {
        let id = req.params.m_id;
        console.log(id);
        if(id){
            Material.findById(id, (err,material) => {
                if(material){
                    return res.json(material);
                }
                else{
                    return res.status(500).json({err : 500, message : "error fetching list"});
                }
            })
        }
        else{
            return res.status(401).json({errorTag : 101, message : "parametre error"})
        }  

    },

    deleteMaterialById   :   (req,res) => {
        if(req.params)
            Material.findByIdAndRemove(req.params.m_id, (err,result) => {
                if(result)
                    return res.status(200).json(result)
                else
                    return res.status(500).json(err)    
            })
    },

    createBulkMaterial : (req,res) => {
        if(!req.user.companyId){
            return res.json({error : "this user can't do that"})
        }
        let admin = req.user;
        var reported = 0;
        materialList = req.body;
        materialList.map((material) => {
            material.companyId = admin.companyId;
            material.providerData = {addedBy : {_id : admin._id, name : admin.firstName + " " + admin.lastName}}
        })
        let report = () => {
            reported = reported + 1;
            if(reported == materialList.length)
                return res.send(reported + ' added');
        }
        materialList.forEach(function(material){
            Material(material).save((err,mat) => {
                console.log(mat)
                if(mat){
                    Company.findByIdAndUpdate(admin.companyId,
                        {
                            $push : { materials : mat._id},
                            $set : { updated : Date.now()}
                        },
                        {safe : true, upsert : true, new : true},
                        (err,result) => {
                            if(result){
                                report();
                            }
                            else{
                                return res.status(500).json({error : 500 , message : err.message})    
                            }
                    })
                }
                else{
                    return res.status(403).json({error : 403 , message : err.message})                
                }
            })
        })
    },
    
    updateMaterialById    : (req,res) => {
        let id = req.params.m_id;
        let mat = req.body;
        console.log(id);
        if(id){
            Material.findByIdAndUpdate(id, mat, (err,material) => {
                if(material){
                    return res.json(material);
                }
                else{
                    return res.status(500).json({errorTag : 100, message : "error fetching list"});
                }
            })
        }
        else{
            return res.status(401).json({errorTag : 101, message : "parameter error"})
        }  
    }
}