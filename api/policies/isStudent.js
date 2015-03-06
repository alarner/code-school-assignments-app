/**
 * isStudent
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any student user
 *                 Assumes that your login action in one of your controllers sets `req.session.passport.user`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var UserType = require('../constants/UserType');

module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.user && req.user.type == UserType.STUDENT) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  if(req.wantsJSON) {
  	res.status(403);
    res.jsonx({success: false, errors: ['Forbidden']});
  }
  else {
  	return res.forbidden('You are not permitted to perform this action.');
  }
};
