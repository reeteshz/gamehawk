exports.validetrade = (req, res, next) => {
    Promise.all([model.findById(req.body.trade), model.findById(req.body.offer)])
    .then(result=>{
        if(result[0].available  == 0 && result[1].available == 0) {
            return next();
        } else {
            
        }
    })
    .catch()
}