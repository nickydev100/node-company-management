const rooferTimeLog   = require('../controllers/rooferTimeLog.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {

    apiRoutes.route('/createRooferTimeLogForProject/:p_id')
        .post(rooferTimeLog.createRooferTimeLogForProject)        // TODO : create rooferTimeLog

    apiRoutes.route('/listAllRooferTimeLogs')
        .get(rooferTimeLog.listAllRooferTimeLogs)       // TODO : list all rooferTimeLog  

    apiRoutes.route('/getRooferTimeLogById/:t_id')
        .get(rooferTimeLog.getRooferTimeLogById)        // TODO : Get 1 rooferTimeLog by id 

    apiRoutes.route('/listRooferTimeLogByProjectId/:p_id')
        .get(rooferTimeLog.listRooferTimeLogByProjectId)        // TODO : Get 1 rooferTimeLog by id    

    apiRoutes.route('/updateRooferTimeLogById/:t_id').all(policy.isManager)
        .put(rooferTimeLog.updateRooferTimeLogById)     // TODO : update 1 rooferTimeLog by id

    apiRoutes.route('/deleteRooferTimeLogById/:t_id')
        .delete(rooferTimeLog.deleteRooferTimeLogById)     // TODO : update 1 rooferTimeLog by id          
}