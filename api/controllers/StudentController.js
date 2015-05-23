/**
 * StudentsController
 *
 * @description :: Server-side logic for managing students
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var UserType = require('../constants/UserType');
module.exports = {
	count: function(req, res) {
		User
		.count()
		.where({deletedAt: null, type: UserType.STUDENT})
		.exec(function(err, count) {
			if(err) {
				res.status(500);
				return res.jsonx(err);
			}
			return res.jsonx({count: count});
		});
	}
};

