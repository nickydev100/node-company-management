const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({ 
  cloud_name: 'dktnhmsjx', 
  api_key: '792293689156324', 
  api_secret: 'VYxx8McbtBw5hFQiC2u6NVTfcyU' 
});

const projectImage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'projectImage',
    allowedFormats: ['jpg', 'png'],
    // filename: function (req, file, cb) {
    filename: function (req, file, cb) {
        console.log(req.user._id);
        cb(undefined, req.user._id);
    }
});

const projectRoof = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'projectRoofPlan',
    allowedFormats: ['pdf', 'png'],
    filename: function (req, projectrf, cb) {
        console.log("projectRoof");
        cb(undefined,  req.user._id);
    }
});

const projectImageParser = multer({ storage: projectImage });
const projectRoofPlan = multer({ storage: projectRoof });

const project   = require('../controllers/project.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {

    apiRoutes.route('/createProject').all(policy.isManager)
        .post(project.createProject)        // TODO : create project

    apiRoutes.route('/listAllProjects').all(policy.isManager)
        .get(project.listAllProjects)       // TODO : list all projects

    apiRoutes.route('/listAllOngoingProjects').all(policy.isManager)
        .get(project.listAllOngoingProjects)       // TODO : list all Ongoing projects    

    apiRoutes.route('/createProjectManager/:p_id').all(policy.isAdmin)
        .post(project.createProjectManager) // TODO : create manager    

    apiRoutes.route('/getProjectById/:p_id')
        .get(project.getProjectById)        // TODO : Get 1 project by id

    apiRoutes.route('/updateProjectById/:p_id')
        .put(project.updateProjectById)     // TODO : update 1 project by id

    apiRoutes.route('/updateProjectImageById/:p_id').all(projectImageParser.single('file'))
        .put(project.updateProjectImageById)     // TODO : update 1 project by id     
    
    //Create New Service through Mobile (07-02-2018 - Bharat)
    apiRoutes.route('/createProjectMob')
    // .all(policy.isManager)
    .all(projectImageParser.single('file'))
    .post(project.createProjectMob)        // TODO : Create New Service through Mobile    

    //.all(projectRoofPlan.single('projectrf')) -> For inserting RoofPlan pdf

}