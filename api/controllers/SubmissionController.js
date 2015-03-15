/**
 * SubmissionController
 *
 * @description :: Server-side logic for managing Submissions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var validator = require('validator');
var uuid = require('node-uuid');
var url = require('url');
var request = require('request');
var unzip = require('unzip');
var path = require('path');
var fs = require('fs-extra');
var recursive = require('recursive-readdir');
var mime = require('mime');

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

				var dir = path.join(process.cwd(), '.tmp/downloads/', uuid.v4());
				fs.mkdirp(dir, function(err) {
					var key;
					if(err) return cb(err);

					var distSubdir = results.assignment.distSubdir;
					if(distSubdir.charAt(0) !== '/') distSubdir = '/'+distSubdir;
					if(distSubdir.charAt(distSubdir.length-1) !== '/') distSubdir += '/';
					function filter(path) {
						var arr = path.split('/');
						arr.shift();
						path = '/'+arr.join('/');
						if(path.substring(0, distSubdir.length) === distSubdir) {
							return path.substring(distSubdir.length);
						}
						return false;
					}


					request
					.get('http://github.com/'+pieces[0]+'/'+pieces[1]+'/archive/master.zip')
					.pipe(fs.createWriteStream(path.join(dir, 'zip.zip')))
					.on('error', function(err) {
						console.log(err);
					})
					.on('close', function() {
						console.log('CLOSE');
						var unzipPath = path.join(dir, 'unzip');
						var q = async.queue(function(task, cb) {
							var fpath = path.join(unzipPath, task.path);
							s3.putObject({
								Bucket: results.bucket.Bucket,
								Key: task.key,
								ACL: 'public-read',
								ContentType: mime.lookup(fpath),
								Body: fs.createReadStream(fpath)
							}, function(err, data) {
								console.log(err, data, mime.lookup(fpath));
								cb(err, data);
							});
						}, 5);
						fs.createReadStream(path.join(dir, 'zip.zip'))
						.pipe(unzip.Extract({ path: unzipPath }))
						.on('error', function(err) {
							cb(err);
						})
						.on('close', function() {
							recursive(unzipPath, function (err, files) {
								// Files is an array of filename
								_.each(files, function(file) {
									var p = file.substring(unzipPath.length+1);
									if(key = filter(p)) {
										q.push({key: key, path: p}, function (err) {
											console.log('finished processing foo');
										});
									}
								});
								cb();
							});
						});
					});
					// This is my failed attempt to stream the whole download right to s3.
					// I kept getting the following errors:
					// 	{ [Error: invalid distance too far back] errno: -3, code: 'Z_DATA_ERROR' }
					// 	[Error: invalid signature: 0x2391703b]
					// .pipe(unzip.Parse())
					// .on('entry', function(entry) {
					// 	// console.log(entry.type);
					// 	if(entry.type === 'File' && (key = filter(entry.path))) {
					// 		console.log(key);
					// 		// entry.autodrain();
					// 		q.push({key: key, entry: entry}, function (err) {
					// 			console.log('finished processing foo');
					// 		});
					// 	}
					// 	else {
					// 		entry.autodrain();
					// 	}
					// })
					// .on('error', function(err) {
					// 	console.log(err);
					// })
					// .on('close', function() {
					// 	console.log('CLOSE!');
					// });
				});
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
	mine: function(req, res) {
		Submission
		.find({
			where: { user: req.user.id, deletedAt: null },
			sort: 'createdAt DESC'
		})
		.populate('grade')
		.populate('assignment')
		.exec(function(err, submissions) {
			if(err) {
				res.status(500);
				res.jsonx(err);
			}
			else {
				res.jsonx(submissions);
			}
		});
	},
	test : function(req, res) {
		console.log(s3);
	}
};

