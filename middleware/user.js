const User = require('../models/user')

module.exports = async function(req, res, next) {
    if(!req.session.user) {
        return next()
    }else {
        req.user = await User.findById(req.session.user._id)
        next()
    }
}