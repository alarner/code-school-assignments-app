var _ = require('lodash');
var validator = require('validator');
var config = require('../config/local.js');
var Sequelize = require('sequelize');
var url = require('url');
var async = require('async');
var githubQueue = require('../api/services/githubQueue');

if(process.argv.length !== 3) {
	console.log('This command takes one argument: a submission id');
	process.exit(1);
}

if(!validator.isInt(process.argv[2])) {
	console.log('Submission id must be an integer');
	process.exit(2);
}

var submissionId = parseInt(process.argv[2]);

var creds = config.connections.postgres;

var sequelize = new Sequelize(creds.database, creds.user, creds.password, {
	host: creds.host,
	dialect: 'postgres'
});

async.auto({
	submission: [function(cb) {
		sequelize.query(
			'SELECT * FROM "submission" WHERE "id"='+submissionId,
			{ type: sequelize.QueryTypes.SELECT}
		)
		.then(function(submissions) {
			if(submissions.length !== 1) {
				return cb('Unknown submission with id='+submissionId);
			}
			
			var submission = submissions[0];
			var parsedUrl = url.parse(submission.url);
			if(parsedUrl.host.toLowerCase() != 'github.com') {
				return cb('Not from GitHub. url='+submission.url);
			}

			if(!parsedUrl.pathname) {
				return cb('The GitHub URL that you supplied is not valid. You must link to a specific repository. url='+submission.url);
			}
			var pieces = _.filter(parsedUrl.pathname.split('/'), function(s) { return s; });
			if(pieces.length < 2) {
				return cb('The GitHub URL that you supplied is not valid. You must link to a specific repository. url='+submission.url);
			}
			return cb(null, submission);
		});
	}],
	user: ['submission', function(cb, results) {
		console.log('user block');
		console.log(results.submission);
		sequelize.query(
			'SELECT * FROM "user" WHERE "id"='+results.submission.user,
			{ type: sequelize.QueryTypes.SELECT}
		)
		.then(function(users) {
			if(users.length !== 1)
				return cb('Unknown user with id='+results.submission.user);

			return cb(null, users[0]);
		});
	}],
	assignment: ['submission', function(cb, results) {
		sequelize.query(
			'SELECT * FROM "assignment" WHERE "id"='+results.submission.assignment,
			{ type: sequelize.QueryTypes.SELECT}
		)
		.then(function(assignments) {
			if(assignments.length !== 1)
				return cb('Unknown assigment with id='+results.submission.assignment);
			if(!assignments[0].distSubdir)
				return cb('Assignment does not have a dist subdir');

			return cb(null, assignments[0]);
		});
	}],
	download: ['submission', 'assignment', 'user', function(cb, results) {
		var parsedUrl = url.parse(results.submission.url);
		var pieces = _.filter(parsedUrl.pathname.split('/'), function(s) { return s; });
		githubQueue.queue.create('github', {
			title: 'GitHub download for '+
					results.user.firstName+' '+results.user.lastName+
					' [assignment='+results.assignment.id+
					', submission='+results.submission.id+']',
			target: 'http://github.com/'+pieces[0]+'/'+pieces[1]+'/archive/master.zip',
			bucket: 'assignments',
			assignment: results.assignment
		}).save(cb);
	}]

}, function(err, results) {
	if(err) {
		console.log(err);
		process.exit(3);
	}
	console.log('yeah!');
	console.log(results);
	process.exit(0);
});

// sequelize.query(
// 	'SELECT * FROM "submission" WHERE "id"='+submissionId,
// 	{ type: sequelize.QueryTypes.SELECT}
// )
// .then(function(submissions) {
// 	if(submissions.length !== 1) {
// 		console.log('Unknown submission with id='+submissionId);
// 		process.exit(3);
// 	}
	
// 	var submission = submissions[0];
// 	var parsedUrl = url.parse(submission.url);
// 	if(parsedUrl.host.toLowerCase() != 'github.com') {
// 		console.log('Not from GitHub. url='+submission.url);
// 		process.exit(3);
// 	}




// });