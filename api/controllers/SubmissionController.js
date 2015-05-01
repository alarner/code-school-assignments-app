/**
 * SubmissionController
 *
 * @description :: Server-side logic for managing Submissions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var validator = require('validator');
var uuid = require('node-uuid');
var url = require('url');
var _ = require('lodash');
var UserType = require('../constants/UserType');

module.exports = {
	create: function(req, res) {
		var data = req.body;
		data.user = req.user.id;
		async.auto({
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
			cleanup: ['validation', function(cb) {
				Submission.update(
					{
						user: data.user,
						assignment: data.assignment,
						grade: null,
						deletedAt: null
					},
					{ deletedAt: new Date() },
					cb
				);
			}],
			// Create the submission record
			create: ['validation', 'cleanup', function(cb) {
				console.log('create');
				Submission.create(data, cb);
			}],
			// Get the assignment from the created submission
			assignment: function(cb) {
				Assignment
				.findOne()
				.where({id: data.assignment})
				.exec(cb);
			},
			// Create a new aws bucket to store the submission data
			bucket: ['create', 'assignment', function(cb, results) {
				var parsedUrl = url.parse(data.url);
				if(parsedUrl.host.toLowerCase() != 'github.com') return cb(null, false);
				if(!results.assignment.distSubdir) return cb(null, false);
				console.log('bucket');
				var createBucket = function(cb) {
					var bucket = uuid.v4();
					s3.createBucket({
						Bucket: bucket,
						ACL: 'public-read',

					}, function(err, data) {
						if(err) {
							switch(err.code) {
								case 'BucketAlreadyOwnedByYou':
								case 'BucketAlreadyExists':
									createBucket(cb);
								break;
								default:
									cb(err);
								break;
							}
						}
						else {
							data.Bucket = bucket;
							cb(null, data);
						}
					});
				};

				createBucket(cb);
			}],
			update: ['create', 'bucket', function(cb, results) {
				if(!results.bucket) return cb(null, results.create);
				console.log('update');
				Submission.update({
					id: results.create.id
				}, {
					location: results.bucket.Location
				}, function(err, results) {
					if(err) return cb(err);
					if(!results.length) {
						return cb({
							"error": "E_BADUPDATE",
							"status": 400,
							"summary": "Could not update the location on the submission record" 
						});
					}
					return cb(null, results[0]);

				});
			}],
			download: ['update', 'assignment', function(cb, results) {
				if(!results.update.location) return cb();
				var parsedUrl = url.parse(data.url);
				if(!parsedUrl.pathname) {
					return cb({
						"error": "E_GITHUBURL",
						"status": 400,
						"summary": "The GitHub URL that you supplied is not valid. You must link to a specific repository."
					});
				}
				var pieces = _.filter(parsedUrl.pathname.split('/'), function(s) { return s; });
				if(pieces.length < 2) {
					return cb({
						"error": "E_GITHUBPATH",
						"status": 400,
						"summary": "The GitHub URL that you supplied is not valid. You must link to a specific repository."
					});
				}

				githubQueue.create('github', {
					title: 'GitHub download for '+
							req.user.firstName+' '+req.user.lastName+
							' [assignment='+data.assignment+
							', submission='+results.update.id+']',
					target: 'http://github.com/'+pieces[0]+'/'+pieces[1]+'/archive/master.zip',
					bucket: results.bucket.Bucket,
					assignment: results.assignment
				}).save(cb);
			}]
		}, function(err, result) {
			if(err) {
				res.status(500);
				res.jsonx(err);
			}
			else {
				res.jsonx(result.update);
			}
		})
	},
	// Working on being able to pull in the grader
	mine: function(req, res) {
		var where = { user: req.user.id, deletedAt: null };
		if(req.param('assignment')) {
			where.assignment = parseInt(req.param('assignment'));
		}
		if(req.param('userId') && req.user.type === UserType.INSTRUCTOR) {
			where.user = req.param('userId');
		}
		var sort = 'createdAt DESC';
		if(req.param('sort')) {
			sort = req.param('sort');
		}
		Submission
		.find({
			where: where,
			sort: sort
		})
		.populate('grade')
		.populate('assignment')
		.populate('user')
		.exec(function(err, submissions) {
			if(err) {
				res.status(500);
				return res.jsonx(err);
			}

			if(!submissions.length) {
				return res.jsonx([]);
			}


			var gradedSubmissions = _.filter(submissions, function(submission) {
				return submission.grade;
			});
			var grades = _.map(gradedSubmissions, function(submission) {
				return submission.grade;
			})
			var userIds = _.pluck(grades, 'user');
			User
			.find()
			.where({id: userIds})
			.exec(function(err, users) {
				if(err) {
					res.status(500);
					return res.jsonx(err);
				}
				users = _.indexBy(users, 'id');
				_.each(submissions, function(submission) {
					if(submission.grade) {
						submission.grade.user = users[submission.grade.user.toString()];
					}
				});
				res.jsonx(submissions);
				
			});
			
			// users = _.indexBy(users[0], 'id'); // Only grab userIds that have a grade

			// console.log('users');
			// console.log(users);
		});
	},
	findAll : function(req, res) {
		Submission
		.find()
		.populate('assignment')
		.populate('grade')
		.populate('user')
		.sort('createdAt ASC')
		.exec(function(err, submissions) {
			if(err) {
				res.status(500);
				return res.jsonx(err);
			}
			res.jsonx(submissions);
		});
	}
};

