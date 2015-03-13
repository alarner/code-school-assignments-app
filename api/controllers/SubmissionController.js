/**
 * SubmissionController
 *
 * @description :: Server-side logic for managing Submissions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var validator = require('validator');

module.exports = {
	create: function(req, res) {
		var data = req.body;
		data.user = req.user.id;
		async.series({
			// Validate data
			validation: function(cb) {
				var err = null;
				if(!data.url) {
					err = {
						"error": "E_NOURL",
						"status": 400,
						"summary": "The submission URL is missing."
					}
				}
				else if(!validator.isURL(data.url, {require_protocol: true})){
					err = {
						"error": "E_BADURL",
						"status": 400,
						"summary": "The submission URL is not valid."
					}
				}
				else if(!data.notes) {
					err = {
						"error": "E_NONOTES",
						"status": 400,
						"summary": "The notes are missing."
					}
				}
				else if(!data.assignment) {
					err = {
						"error": "E_NOASSIGNMENT",
						"status": 400,
						"summary": "The assignment id is missing."
					}
				}
				else if(!validator.isInt(data.assignment)) {
					err = {
						"error": "E_BADASSIGNMENT",
						"status": 400,
						"summary": "The assignment id is invalid."
					}
				}

				cb(err);
			},
			// Delete any old ungraded submissions for this project
			cleanup: function(cb) {
				Submission.update(
					{
						user: data.user,
						assignment: data.assignment,
						grade: null
					},
					{ deletedAt: new Date() },
					cb
				);
			},
			create: function(cb) {
				Submission.create(data, cb);
			}
		}, function(err, result) {
			if(err) {
				res.status(500);
				res.jsonx(err);
			}
			else {
				res.jsonx(result.create);
			}
		})
	},
	mine: function(req, res) {
		Submission
		.find({
			where: { user: req.user.id },
			sort: 'createdAt DESC'
		})
		.populate('grade')
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

