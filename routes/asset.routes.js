const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const uid = require('uid-safe');

cloudinary.config({ 
  cloud_name: 'dktnhmsjx', 
  api_key: '792293689156324', 
  api_secret: 'VYxx8McbtBw5hFQiC2u6NVTfcyU' 
});

const projectOtherFile = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'projectOtherFile',
    allowedFormats: ['pdf', 'png' , 'jpg'],
    filename: function (req, file, cb) {
        cb(undefined, req.params.p_id + "/" +  uid.sync(9));
    }
});

const projectRoofPlan = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'projectRoofPlan',
    allowedFormats: ['pdf', 'png', 'jpg'],
    filename: function (req, file, cb) {
        console.log(file);
        cb(undefined, req.params.p_id + "/" +  uid.sync(9));
    }
});

const projectImageFile = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'projectImageFile',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        cb(undefined, req.params.p_id+ "/" +  uid.sync(9));
    }
});

const taskProgressImageFile = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'taskProgressImageFile',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, files, cb) {
        cb(undefined, req.params.t_id+ "/" + uid.sync(9));
    }
});

const rooferConcernImageFile = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'taskProgressImageFile',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        cb(undefined, req.params.t_id+ "/" + uid.sync(9));
    }
});

const GenralImageFile = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'GenralImageFile',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        cb(undefined, req.user._id+ "/" +  uid.sync(9));
    }
});

const projectImageFileParser = multer({ storage: projectImageFile });
const projectRoofPlanParser = multer({ storage: projectRoofPlan });
const projectOtherFileParser = multer({ storage: projectOtherFile });
const taskProgressImageFileParser = multer({ storage: taskProgressImageFile });
const rooferConcernImageFileParser = multer({ storage: rooferConcernImageFile });
const genralImageFileParser = multer({ storage: GenralImageFile });

const asset     = require('../controllers/asset.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {
    

    /**
     *      <ProjectAssetsMobile>
     */
    // apiRoutes.route('/createProjectMobAddRoofplans/:p_id')
    // .all(projectRoofPlanParser.array('file',5))
    // .post(asset.createProjectMobAddRoofplans);
     /**
     *      </ProjectAssetsMobile>
     */

    /**
     *      <ProjectAssetsMobile>
     */
    apiRoutes.route('/createProjectMobAddOtherFiles/:p_id')
    .all(projectOtherFileParser.array('files',5))
    .post(asset.createProjectMobAddOtherFiles);

    apiRoutes.route('/createProjectMobAddImages/:p_id')
    .all(projectOtherFileParser.array('files',5))
    .post(asset.createProjectMobAddImages);

    // apiRoutes.route('/createProjectMobAddRoofplans/:p_id')
    // .all(projectRoofPlanParser.array('files',5))
    // .post(asset.createProjectMobAddRoofplans);
     /**
     *      </ProjectAssetsMobile>
     */
     
    /**
     *      <GenralAssetsAPIs>
     */

    apiRoutes.route('/getAssetById/:a_id')
        .get(asset.getAssetById)  

    apiRoutes.route('/addGenralImageFile')
        .all(genralImageFileParser.single('file'))
        .post(asset.addGenralImageFile)    

    /**
     *      </GenralAssetsAPIs>
     */
    /**
     *      <ProjectAssets>
     */
    apiRoutes.route('/addAssetProjectImageById/:p_id')
        .all(projectImageFileParser.single('file'))
        .post(asset.addAssetProjectImageById)

    apiRoutes.route('/addAssetProjectOtherFileById/:p_id')
        .all(projectOtherFileParser.single('file'))
        .post(asset.addAssetProjectOtherFileById)

    apiRoutes.route('/addAssetProjectRoofPlanById/:p_id')
        .all(policy.isManager)
        .all(projectRoofPlanParser.single('file'))
        .post(asset.addAssetProjectRoofPlanById)
    
    /**
     *      </ProjectAssets>
     */

    /**
     *      <TaskProgress>
     */
    apiRoutes.route('/addAssetTaskProgressById/:t_id')
        .all(taskProgressImageFileParser.array('files',5))
        .post(asset.addAssetTaskProgressById)
    /**
     *      </TaskProgress>
     */


    /**
     *      <RooferConcern>
     */
    apiRoutes.route('/addAssetRooferConcernById/:rf_id')
        .all(rooferConcernImageFileParser.array('files',5))
        .post(asset.addAssetRooferConcernById)
    /**
     *      </RooferConcern>
     */

     
}