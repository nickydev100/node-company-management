module.exports = {
    isSuperAdmin : (req,res,next) => {
        if(req.user.authorizationCode !== 15){
            return res.status(403).json({error : 403 , message : "not authorised"})
        }
        else{
            next()
        }
    },

    isAdmin : (req,res,next) => {
        if(req.user.authorizationCode < 14){
            return res.status(403).json({error : 403 , message : "not authorised"})
        }
        else{
            next()
        }
    },

    isManager : (req, res, next) => {
        if(req.user.authorizationCode < 12){
            return res.status(403).json({error : 403 , message : "not authorised"})
        }
        else{
            next()
        }
    }
}