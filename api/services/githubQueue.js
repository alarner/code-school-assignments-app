var kue = require('kue');
var async = require('async');
var request = require('request');
var path = require('path');
var mime = require('mime');
var fs = require('fs-extra');
var recursive = require('recursive-readdir');
var uuid = require('node-uuid');
var config = require('../../config/redis');
var _ = require('lodash');
var s3 = require('./s3');
var nodegit = require('nodegit');
var queue = kue.createQueue({
	prefix: 'github',
	redis: {
		port: config.redis.port,
		host: config.redis.host
	}
});
var progress = {
	START_ALL: 1,
	START_MKDIR: 2,
	FINISH_MKDIR: 3,
	START_DOWNLOAD: 4,
	FINISH_DOWNLOAD: 5,
	START_UNZIP: 6,
	FINISH_UNZIP: 7,
	READDIR: 8,
	FINISH_READDIR: 9,
	FINISH_UPLOAD: 10,
	START_DELETE: 11,
	FINISH_DELETE: 12,
	FINISH_ALL: 13
};

queue.on('error', function(err) {
	console.trace(err);
});

// job = {
// 	target: 'http://github.com/alarner/test',
//	bucket: '3905416d-2097-4f5b-923f-945b876f9b1b'
// }
queue.process('github', function(job, done){
	job.progress(progress.START_ALL, progress.FINISH_ALL);
	var distSubdir = job.data.assignment.distSubdir;
	if(distSubdir) {
		if(distSubdir.charAt(0) !== '/') {
			distSubdir = '/'+distSubdir;
		} 
		if(distSubdir.charAt(distSubdir.length-1) !== '/') {
			distSubdir += '/';
		} 
	}
	async.auto({
		dir: function(cb) {
			job.progress(progress.START_MKDIR, progress.FINISH_ALL);
			var dir = path.join(process.cwd(), '.tmp/downloads/', uuid.v4());
			fs.mkdirp(dir, function(err) {
				if(err) return cb(err);
				job.log('Finished creating directory %s', dir);
				job.progress(progress.FINISH_MKDIR, progress.FINISH_ALL);
				return cb(null, dir);
			});
		},
		download: ['dir', function(cb, results) {
			job.progress(progress.START_DOWNLOAD, progress.FINISH_ALL);
			// var zipFile = path.join(results.dir, 'all.zip');
			job.log('Starting downloading from %s', job.data.target);
			// request
			// .get(job.data.target)
			// .pipe(fs.createWriteStream(zipFile))
			// .on('error', function(err) {
			// 	cb(err);
			// })
			// .on('end', function() {
			// 	job.log('Finished downloading end %s', job.data.target);
			// })
			// .on('close', function() {
			// 	job.log('Finished downloading from %s', job.data.target);
			// 	job.progress(progress.FINISH_DOWNLOAD, progress.FINISH_ALL);
			// 	cb(null, zipFile)
			// });
			var savePath = path.join(results.dir, 'unzipped');
			nodegit.Clone(job.data.target, savePath)
			.then(function(repository) {
				job.log('Finished downloading from %s', job.data.target);
				cb(null, savePath);
			})
			.catch(function(err) {
				job.log('Error downloading from %s', job.data.target);
				cb(err);
			});
		}],
		// unzip: ['dir', 'download', function(cb, results) {
		// 	job.progress(progress.START_UNZIP, progress.FINISH_ALL);
		// 	var unzipPath = path.join(results.dir, 'unzipped');

		// 	var zip = new AdmZip(results.download);
		// 	zip.extractAllTo(unzipPath);
		// 	cb(null, unzipPath);
		// }],
		upload: ['download', function(cb, results) {
			var uploadErr = null;
			job.log('Start uploading to S3');
			job.progress(progress.START_UPLOAD, progress.FINISH_ALL);
			function filter(p) {
				var arr = p.split('/');
				arr.shift();
				p = '/'+arr.join('/');
				if(p.substring(0, distSubdir.length) === distSubdir) {
					return p.substring(distSubdir.length);
				}
				return false;
			}
			function uploadFinished(err) {
				if(err && !uploadErr) {
					uploadErr = err;
				}
			}
			var uploadQueue = async.queue(function(task, cb) {
				job.log('Start uploading %s', task.key);
				var fpath = path.join(results.download, task.path);
				job.log('Start uploading %s', JSON.stringify(job.data.submission));
				var putKey = path.join(job.data.submission.id.toString(), task.key);
				putKey = putKey.toLowerCase();
				s3.putObject({
					Bucket: job.data.bucket,
					Key: putKey,
					ACL: 'public-read',
					ContentType: mime.lookup(fpath),
					Body: fs.createReadStream(fpath)
				}, function(err, data) {
					if(err) {
						job.log('Error uploading %s %s', task.key, err);
					}
					else {
						job.log('Finished uploading %s', task.key);
					}
					cb(err, data);
				});
			}, 5);
			uploadQueue.drain = function() {
				if(!uploadErr) {
					job.log('Finished uploading to S3');
					job.progress(progress.FINISH_UPLOAD, progress.FINISH_ALL);
				}
				cb(uploadErr);
			};
			recursive(results.download, function (err, files) {
				job.log('Finished reading directory %s. %d files found.', results.download, files.length);
				job.progress(progress.READDIR, progress.FINISH_ALL);
				// Files is an array of filename
				_.each(files, function(file) {
					var p = file.substring(results.download.length+1);
					if(key = filter(p)) {
						uploadQueue.push({key: key, path: p});
					}
				});

				if(uploadQueue.idle()) {
					cb(uploadErr);
				}
			});
		}],
		rmdir: ['dir', 'upload', function(cb, results) {
			job.progress(progress.START_DELETE, progress.FINISH_ALL);
			fs.remove(results.dir, function(err) {
				if(!err) job.progress(progress.FINISH_DELETE, progress.FINISH_ALL);
				cb(err);
			});
		}]
	}, function(err, results) {
		if(!err) job.progress(progress.FINISH_ALL, progress.FINISH_ALL);
		done(err);
	});
});

module.exports = {
	init: function() {
		// Start up the GUI
		kue.app.listen(3000);
		kue.app.set('title', 'Iron Assignments Queue');
	},
	queue: queue
};