const request       = require("request");
const Company          = require('../models/company.model');
const User             = require('../models/user.model');
const Project          = require('../models/project.model');
const RooferAllotment = require('../models/rooferAllotment.model');
const weather = require("../helper/weather.controller");


const assign = (project, ra) => {
    if (!project.rooferAllotment)
        project.rooferAllotment = {};
    if (!project.teamLeaderAllotment)
        project.teamLeaderAllotment = {};

    if (ra.isLeader) {
        project.rooferAllotment[ra.rooferId] = ra.rooferName;
        project.teamLeaderAllotment[ra.rooferId] = ra.rooferName;
    }
    else
        project.rooferAllotment[ra.rooferId] = ra.rooferName;

    return project;
}
module.exports = {

    createProject   : (req,res) => {
        let user = req.user;
        let project = req.body;
        console.log(project);
        if(project){
            project.companyId = user.companyId;
            project.providerData = {createdBy : user.displayName}
            console.log(req.user);
            console.log(req.body);
            Project(project).save((err,project) => {
                if(err){
                    return res.status(500).json({err : 500, message : err.message});
                }
                else{
                    console.log(project);
                    return res.json(project);
                }
            })
        }
        else{
            return res.json({errorTag : 102, message : "No project found in body"})
        }
    },

    listAllProjects : (req, res) => {
        let user = req.user;
        console.log("TO list all projects");
        console.log(user);
        let chunk = null, page = null, active = null;
        let lat = lng = 0;
        let opts = {};
        opts.companyId = user.companyId;
        console.log("checking company Id");
        console.log(opts.companyId);
        let minDate = new Date(-8640000000000000);
        let maxDate = new Date(8640000000000000)
        if(req.query.chunk && req.query.page){
            chunk = parseInt(req.query.chunk);
            page = parseInt(req.query.page);
        }
        switch (req.query.active) {
            case "true":
                active = true
                break;
            case "false":
                active = false
                break;
            default:
                active = null;
                break;
        }
        let search = "";
        let regex = null;
        if(req.query.search){
            regex = new RegExp(req.query.search,'gi');
        }
        else{
            regex = new RegExp();
        }
        if(req.query.lat && req.query.lng){
            lat = parseFloat(req.query.lat);
            lng = parseFloat(req.query.lng);
            opts['address.loc'] = {
                        '$near' : {
                            '$geometry': { type: "Point", coordinates: [lat,lng] }
                        }
                    }
        }
        if(req.query.minDate && req.query.maxDate){
            minDate = new Date(req.query.minDate);
            maxDate = new Date(req.query.maxDate);
            if(minDate > maxDate){
                //handle invalid date
                return res.json({errorTag : 106, message : "invalid date query"})
            }
        }
        let s = (page - 1) * chunk;
        Project.find({$or : [
                {'projectName' : regex},
                {'projectDescription' : regex},
                {'client.clientName':regex},
                {'address.line1' : regex},
                {'address.line2' : regex},
                {'address.line3' : regex},
                {'address.city' : regex}]})
                .where(opts)
                .where('startDate')
                .gte(minDate)
                .where('endDate')
                .lte(maxDate)
                .skip(s)
                .limit(chunk)
                .sort(active)
                .select('_id projectName startDate endDate address projectStatus isServiceProject created')
                .exec((err,list) => {
                    if(err){
                        return res.status(500).json({errorTag : 100, message : err.message})
                    }
                    Project.count({
                        companyId : req.user.companyId
                        },(err,count) => {
                            console.log(count);
                            return res.status(200).json({total : count, list : list})
                        })
                })
    },

    listAllOngoingProjects : (req, res) => {
        let user = req.user;
        let chunk = null, page = null, active = null;
        if(req.query.chunk && req.query.page){
            chunk = parseInt(req.query.chunk);
            page = parseInt(req.query.page);
        }
        switch (req.query.active) {
            case "true":
                active = true
                break;
            case "false":
                active = false
                break;
            default:
                active = null;
                break;
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
        Project.find({'projectName' : regex})
                .where({companyId : user.companyId})
                .where('projectStatus').gt(0).lt(100)
                .skip(s)
                .limit(chunk)
                .sort(active)
                .select('_id projectName startDate endDate address projectStatus isServiceProject')
                .exec((err,list) => {
                    if(err){
                        return res.status(500).json({errorTag : 100, message : err.message})
                    }
                    Project.count({
                        companyId : req.user.companyId
                        },(err,count) => {
                            return res.status(200).json({total : count, list : list})
                        })
                })
    },

    updateProjectImageById : (req,res) => {
        let file = req.file;
        console.log(req.file);
        console.log(req.body);
        if(file){
            Project.findByIdAndUpdate(req.params.p_id, {$set : {projectImage : file.secure_url}} ,(err,result) => {
                return res.json(result);
            }) 
        }
        else{
            return res.json({status : 500})
        }
    },

    createProjectManager:   (req,res) => {},

    getProjectById  : (req,res) => {
        let id = req.params.p_id;
        console.log(id);
        if(id){
            Project.findById(id, (err,project) => {
                if(project){
                    let coordinates = project.address.loc.coordinates;
                    console.log(coordinates);
                    //projectData.project=project;
                    let url = "http://api.openweathermap.org/data/2.5/weather?lat="+coordinates[0]+"&lon="+coordinates[1]+"&APPID="+"c9e375aa67f3039b2f28ad01e47b3d4d";
                    request(url, function (error, response, body) {
                        if(body){
                            project.weatherData = body;
                            //projectData.weatherData=body;
                        }
                        else{
                            project.weatherData=error;
                           console.log("Error in saving weather data");
                        }
                         
                            console.log(project);
                            return res.json(project); 
                    });
                }
                else{
                    return res.status(500).json({err : 100, message : "error fetching list"});
                }
            })
        }
        else{
            return res.status(401).json({errorTag : 101, message : "parameter error"})
        }
    },
    
    updateProjectById   :   (req,res) => {
        let id = req.params.p_id;
        let project = req.body;
        console.log(id);
        if(id){
            Project.findByIdAndUpdate(id, project, (err,p) => {
                if(project){
                    return res.json(p);
                }
                else{
                    return res.status(500).json({errorTag : 100, message : "error project"});
                }
            })
        }
        else{
            return res.status(401).json({errorTag : 101, message : "parameter error"})
        }        
    },

    //Create New Project through Mobile (07-02-2018)
    createProjectMob   : (req,res) => { 
        req.body.address={loc:{coordinates:[req.body.lat,req.body.long]}};
            
        let user = req.user;
        console.log(user);
        let project = req.body;
        let rooferallot = {};
        let file = req.file;  
        project.projectImage = req.file.secure_url;

        
        if(project){
            project.companyId = user.companyId;
            project.providerData = {createdBy : user.displayName}
            if(req.body.isServiceProject ===  false || req.body.isServiceProject ===  'false') {
                project.isServiceProject = false;
            }
    
            Project(project).save((err,project) => {
                if(err){
                    console.log(err);
                    return res.status(500).json({err : 500, message : err.message});
                }
                else{
                    project.companyId = user.companyId;
                    project.providerData = { createdBy: user.displayName, id: user._id };
                    rooferallot.rooferId = user._id;
                    
                    rooferallot.rooferName = user.displayName;
                    rooferallot.projectId = project._id;
                    rooferallot.projectId = rooferallot.projectId
                    rooferallot.companyId = user.companyId;
                    rooferallot.from = req.body.startDate;
                    rooferallot.to = req.body.endDate;
                    // console.log(rooferallot);
                    RooferAllotment(rooferallot).save((err, ra) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ errorTag: 100, message: "error adding rooferAllotment" });
                        }
                        else {
                            // console.log(ra);
                            //insert record in project
                            if (ra.projectId) {
                                Project.findById(ra.projectId, (err, rooferA) => {
                                    rooferA = assign(rooferA, ra);
                                    Project.findByIdAndUpdate(ra.projectId, rooferA, (err, result) => {
                                   
                                        if (result){
                                            console.log("Success ");
                                            return res.json(project);
                                        }
                                        else{
                                            return res.status(500).json({ errorTag: 100, message: err.message })
                                        }
                                    })
                                })
                            }
                            else {
                                return res.json(ra)
                            }
                        }
                    })
                }
            })
        }
        else{
            return res.json({errorTag : 102, message : "No project found in body"})
        }
    }

    
    
}