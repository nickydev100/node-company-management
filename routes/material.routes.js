const material   = require('../controllers/material.controller')
const entityTag = require('../controllers/entityTag.controller');
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {

    apiRoutes.route('/createMaterial').all(policy.isManager)
        .post(material.createMaterial)        // TODO : create material

    apiRoutes.route('/listAllMaterials')
        .get(material.listAllMaterials)       // TODO : list all materials

    apiRoutes.route('/getMaterialById/:m_id')
        .get(material.getMaterialById)        // TODO : Get 1 material by id

    apiRoutes.route('/updateMaterialById/:m_id')
        .put(material.updateMaterialById)     

    apiRoutes.route('/deleteMaterialById/:h_id').all(policy.isManager)
        .delete(material.deleteMaterialById)

    apiRoutes.route('/createBulkMaterial').all(policy.isManager)
        .post(material.createBulkMaterial)    

    apiRoutes.route('/getComboSytemTag').all(policy.isManager)
        .get(entityTag.getComboSytemTag);
    // apiRoutes.route('/updateMaterialPic').all(policy.isManager)
    //     .post(material.updateMaterialPic)        // TODO : create material img
}