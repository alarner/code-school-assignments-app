/**
 * SubmissionController
 *
 * @description :: Server-side logic for managing Submissions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res) {
		var data = req.body;
		data.user = req.user.id;
		Submission.create(data, function(err, submission) {
			if(err) {
				res.status(500);
				res.jsonx(err);
			}
			else {
				res.jsonx(submission);
			}
		});
	},
	mine: function(req, res) {
		Submission
		.find({
			where: { user: req.user.id },
			sort: 'createdAt DESC'
		})
		.exec(function(err, submissions) {
			if(err) {
				res.status(500);
				res.jsonx(err);
			}
			else {
				res.jsonx(submissions);
			}
		});
	}
};

