const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({ 
  cloud_name: 'dktnhmsjx', 
  api_key: '792293689156324', 
  api_secret: 'VYxx8McbtBw5hFQiC2u6NVTfcyU' 
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'companyLogo',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        cb(undefined, req.user.companyId);
    }
});
const companyLogoParser = multer({ storage: storage });

const company   = require('../controllers/company.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {
    /**
     * COMPANY RELATED ROUTES
     */
    apiRoutes.route('/createCompany').all(policy.isSuperAdmin)  //POST
        .post(company.createCompany);    //working

    apiRoutes.route('/listAllCompany').all(policy.isSuperAdmin) //GET
        .get(company.listAllCompany);    //working

    apiRoutes.route('/createCompanyAdmin/:cmp_id').all(policy.isSuperAdmin) //POST
        .post(company.createCompanyAdmin);   //working    

    apiRoutes.route('/getCompanyById/:cmp_id')  //GET
        .get(company.getCompanyById);

    apiRoutes.route('/updateCompanyAdminById/:adm_id').all(policy.isSuperAdmin)
        .post(company.updateCompanyAdminById);

    apiRoutes.route('/updateCompanyById/:cmp_id').all(policy.isManager)   //PUT
        .put(company.updateCompanyById);

    apiRoutes.route('/toggleCompanyIsActiveById/:c_id').all(policy.isSuperAdmin)
        .put(company.toggleCompanyIsActiveById);   
        
        /**
         * Registration of a new company..
         */
    openRoutes.route('/registerCompany')
              .post(company.registerCompany);
     
            
    openRoutes.route('/registerCompanyAdmin/:cmp_id')
            .post(company.registerCompanyAdmin);
    

    
    /**
     * EMPLOYEE RELATED ROUTES
     */

    apiRoutes.route('/getEmployeeById/:emp_id').all(policy.isManager)
        .get(company.getEmployeeById);

    apiRoutes.route('/updateManagerById/:manager_id').all(policy.isAdmin)   //PUT
        .put(company.updateManager)
        
    apiRoutes.route('/updateRooferById/:roofer_id').all(policy.isManager)  //PUT
        .put(company.updateRoofer)    

    apiRoutes.route('/updateCompanyLogo').all(companyLogoParser.single('image'))
        .post(company.updateCompanyLogo)

    apiRoutes.route('/createBulkRoofer').all(policy.isManager)  //POST
        .post(company.bulkInsertRoofers)

}