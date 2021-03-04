const Company          = require('../models/company.model');
const TaskProgress             = require('../models/taskProgress.model');
const RooferConcern = require('../models/rooferConcern.model');
const Project          = require('../models/project.model');
const Asset            = require('../models/asset.model');

module.exports = {

    getAssetById : (req,res) => {
        let a_id = req.params.a_id;
        Asset.findById(a_id,(err,asset) => {
            if(!err){
                return res.json(asset);
            }
            else{
                return res.status(500).json({errorTag : 500, message : err.message})
            }
        })
    }, 

    addAssetProjectImageById : (req,res) => {
        console.log("in this fun");
        let file = req.file;
        if(req.query.t)
            file.assetName = req.query.t;
        if(req.query.d)
            file.assetDescription = req.query.d;
        file.companyId = req.user.companyId;
        let pid = req.params.p_id;
        file.projectId = pid;
        if(file && pid){
            Asset(file).save((err,file) => {
                if(file){
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.images": file}},
                            {safe: true, upsert: true},
                            function(err, model) {
                                if(!err)
                                    return res.json(file)
                                else
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    },

    addAssetProjectOtherFileById : (req,res) => {
        let file = req.file;
        if(req.query.t)
            file.assetName = req.query.t;
        if(req.query.d)
            file.assetDescription = req.query.d;
        file.companyId = req.user.companyId;
        let pid = req.params.p_id;
        file.projectId = pid;
        if(file && pid){
            Asset(file).save((err,file) => {
                if(file){
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.others": file}},
                            {safe: true, upsert: true},
                            function(err, model) {
                                if(!err)
                                    return res.json(file)
                                else
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    },

    addAssetProjectRoofPlanById : (req,res) => {
        let file = req.file;
        if(req.query.t)
            file.assetName = req.query.t;
        if(req.query.d)
            file.assetDescription = req.query.d;
        console.log(file);
        file.companyId = req.user.companyId;
        let pid = req.params.p_id;
        file.projectId = pid;
        if(file && pid){
            Asset(file).save((err,file) => {
                if(file){
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.roofPlans": file}},
                            {safe: true, upsert: true},
                            function(err, model) {
                                if(!err)
                                    return res.json(file)
                                else
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    },

    addAssetTaskProgressById : (req,res) => {
        let files = req.files;
        files.forEach(function(element) {
            element.companyId = req.user.companyId;
        }, this);
        let id = req.params.t_id;
        if(files && id){
            Asset.insertMany(files, (err, assets) => {
                if(err){
                    return res.status(500).json({errorTag : 100, message : err.message}) 
                }
                else{
                    console.log(assets);
                    TaskProgress.findByIdAndUpdate(
                            id,
                            {$push: {"assetsList": assets}},
                            {safe: true, upsert: true, new: true},
                            function(err, model) {
                                if(!err){
                                    console.log(model);
                                    return res.json(model)
                                }
                                else{
                                    console.log("Error");
                                    return res.status(500).json({errorTag : 100, message : err.message})     
                                }
                            }
                    )
                }
            })
        }
        else{
            return res.json({errorTag : 100})
        }
    },

    addAssetRooferConcernById : (req,res) => {
        let files = req.files;
        files.forEach(function(element) {
            element.companyId = req.user.companyId;
        }, this);
        let id = req.params.rf_id;
        if(files && id){
            Asset.insertMany(files, (err, assets) => {
                if(err){
                    return res.status(500).json({errorTag : 100, message : err.message}) 
                }
                else{
                    RooferConcern.findByIdAndUpdate(
                            id,
                            {$push: {"assetsList":{$each: assets}}},
                            {safe: true, upsert: true},
                            function(err, model) {
                                if(!err)
                                    return res.json(model)
                                else
                                    return res.status(500).json({errorTag : 100, message : err.message})     
                            }
                    )
                }
            })
        }
        else{
            return res.json({errorTag : 100})
        }
    },
    
    addGenralImageFile : (req, res) => {
        let file = req.file;
        file.companyId = req.user.companyId;
        file.projectId = req.query.projectId ? req.query.projectId : "";
        file.assetName = req.query.assetName ? req.query.assetName : "Genral Image";
        file.assetDescription = req.query.assetDescription ? req.query.assetDescription : "Genral Asset Description";
        Asset(file).save((err,sFile) => {
            if(!sFile){
                return res.status(500).json({errorTag : 100, message : err.message});
            }
            else{    
                return res.json(sFile); 
            }   
        })
    },


    // Roofplan for Project Mob
    // addAssetProjectMobRoofFileById : (req,res) => {
    //     // console.log("IN addAssetProjectMobById");
    //     // console.log(req.user);
    //     console.log(req.body);
    //     console.log("req body");
    //     console.log(req.body.assetDescription);
    //     console.log(req.body.assetDescription[0]);
    //     let file = req.files;
    //      for (var i=0; i<req.body.assetDescription.length;i++){
    //          console.log("in for");
    //          file[i].assetName = req.body.assetName[i];
    //          file[i].assetDescription = req.body.assetDescription[i];
    //      }
    //     file.companyId = req.user.companyId;
    //     let pid = req.params.p_id;
    //     file.projectId = pid;
    //     if(file && pid){
    //         Asset.insertMany(file, (err, assets) => {
    //             console.log("Asset LIst");
    //             console.log(assets);
    //             if(assets){
    //                 // console.log(assets);
    //                 Project.findByIdAndUpdate(
    //                         pid,
    //                         {$push: {"projectFiles.roofPlans": {$each: assets}}},
    //                         {safe: true, upsert: true},
    //                         function(err, model) {
    //                             if(!err){
    //                                 console.log(model);
    //                                 return res.json(model)
    //                             }
    //                             else{
    //                                 console.log("Error");
    //                                 return res.status(500).json({errorTag : 500, message : err.message})     
    //                             }
    //                         }
    //                 )
    //             }
    //             else{
    //                 return res.status(500).json({errorTag : 500, message : err.message})
    //             }
    //         })
    //     }
    //     else{
    //         return res.json({status : 500})
    //     }
    // },
    
    createProjectMobAddOtherFiles : (req,res) => {
       
        
        let pid = req.params.p_id;

        if(!req.files) {
            return res.status(400).json({
                message : "Files are missing"
            });
        }

        let file = req.files;
        for (var i=0; i<req.body.assetDescription.length;i++){
            file[i].assetName = req.body.assetName[i];
            file[i].assetDescription = req.body.assetDescription[i];
        }
        let updatedFiles = file.map(x => {
            x.companyId = req.user.companyId;
            x.projectId = pid;
            return x;
        });

        if(updatedFiles && pid){    
            Asset.insertMany(updatedFiles, (err, assets) => {
                console.log("Asset LIst");
                console.log(assets);
                if(assets){
                    // console.log(assets);
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.others": assets}},
                            {safe: true, upsert: true , new : true},
                            function(err, model) {
                                if(!err){
                                    console.log(model);
                                    return res.json(model)
                                }
                                else{
                                    console.log("Error");
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                                }
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    },

    createProjectMobAddImages : (req,res) => {
       
        
        let pid = req.params.p_id;

        if(!req.files) {
            return res.status(400).json({
                message : "Files are missing"
            });
        }

        let file = req.files;

        let updatedFiles = file.map(x => {
            x.companyId = req.user.companyId;
            x.projectId = pid;
            return x;
        });

        if(updatedFiles && pid){    
            Asset.insertMany(updatedFiles, (err, assets) => {
                console.log("Asset LIst");
                console.log(assets);
                if(assets){
                    // console.log(assets);
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.images": assets}},
                            {safe: true, upsert: true , new : true},
                            function(err, model) {
                                if(!err){
                                    console.log(model);
                                    return res.json(model)
                                }
                                else{
                                    console.log("Error");
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                                }
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    },

    createProjectMobAddRoofplans : (req,res) => {
       
        
        let pid = req.params.p_id;

        if(!req.files) {
            return res.status(400).json({
                message : "Files are missing"
            });
        }

        let file = req.files;

        let updatedFiles = file.map(x => {
            x.companyId = req.user.companyId;
            x.projectId = pid;
            return x;
        });

        if(updatedFiles && pid){    
            Asset.insertMany(updatedFiles, (err, assets) => {
                console.log("Asset LIst");
                console.log(assets);
                if(assets){
                    // console.log(assets);
                    Project.findByIdAndUpdate(
                            pid,
                            {$push: {"projectFiles.roofPlans": assets}},
                            {safe: true, upsert: true , new : true},
                            function(err, model) {
                                if(!err){
                                    console.log(model);
                                    return res.json(model)
                                }
                                else{
                                    console.log("Error");
                                    return res.status(500).json({errorTag : 500, message : err.message})     
                                }
                            }
                    )
                }
                else{
                    return res.status(500).json({errorTag : 500, message : err.message})
                }
            })
        }
        else{
            return res.json({status : 500})
        }
    }

    
}