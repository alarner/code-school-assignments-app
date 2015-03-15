/**
 * AssignmentController
 *
 * @description :: Server-side logic for managing assignments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var UserType = require('../constants/UserType');
module.exports = {
	findOne: function(req, res) {
		var submissionParams = { deletedAt: null };
		if(req.user.type != UserType.INSTRUCTOR) {
			submissionParams.user = req.user.id;
		}
		Assignment.findOne(req.param('email'))
		.where({ deletedAt: null })
		.populate('submissions', {where: submissionParams})
		.exec(function(err, assignment) {
			if(err) return res.serverError(err);
			if(!assignment) return res.notFound('No record found with the specified `id`.');
			res.ok(assignment);
		});

	}
};

