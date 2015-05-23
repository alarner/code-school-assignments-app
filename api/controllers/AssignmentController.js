/**
 * AssignmentController
 *
 * @description :: Server-side logic for managing assignments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var UserType = require('../constants/UserType');
var async = require('async');
module.exports = {
	findOne: function(req, res) {
		var submissionParams = { deletedAt: null };
		if(req.user.type != UserType.INSTRUCTOR) {
			submissionParams.user = req.user.id;
		}
		Assignment.findOne(req.param('id'))
		.where({ deletedAt: null })
		.populate('submissions', {where: submissionParams})
		.exec(function(err, assignment) {
			if(err) return res.serverError(err);
			if(!assignment) return res.notFound('No record found with the specified `id`.');
			res.ok(assignment);
		});

	},
	summary: function(req, res) {
		async.parallel({
			students: function(cb) {
				User
				.find()
				.where({type: UserType.STUDENT, deletedAt: null})
				.exec(cb)
			},
			submissions: function(cb) {
				Submission
				.find()
				.populate('grade')
				.where({assignment: req.param('id'), deletedAt: null})
				.sort('createdAt DESC')
				.exec(cb);
			}
		}, function(err, results) {
			var json = [];
			for(var i in results.students) {
				var student = results.students[i];
				student.__proto__ = {};

				json.push(student);
			}
			var users = _.indexBy(json, 'id');

			for(var i in users) {
				users[i].submissions = [];
			}

			_.each(results.submissions, function(submission) {
				var userId = submission.user.toString();
				if(users.hasOwnProperty(userId)) {
					users[userId].submissions.push(submission.toObject());
				}
			});

			res.jsonx(_.values(users));

			

			// var returnUsers = [];
			// for(var i in users) {
			// 	returnUsers.push(users[i]);
			// }
			// console.log(JSON.stringify(returnUsers));
			// res.set('Content-Type', 'application/json');
			// res.end(JSON.stringify(returnUsers));
		})
	}
};

