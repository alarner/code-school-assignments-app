/**
 * GradeController
 *
 * @description :: Server-side logic for managing grades
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	submission: function(req, res) {
		var submissionId = parseInt(req.body.submissionId);
		var score = parseInt(req.body.score);
		if(!req.body.submissionId) {
			res.status(400);
			res.jsonx({
				"error": "E_BADPARAM",
				"status": 400,
				"summary": "Missing submission id."
			});
		}
		else if(isNaN(submissionId)) {
			res.status(400);
			res.jsonx({
				"error": "E_BADPARAM",
				"status": 400,
				"summary": "Bad submission id."
			});
		}
		else if(!req.body.hasOwnProperty('score')) {
			res.status(400);
			res.jsonx({
				"error": "E_BADPARAM",
				"status": 400,
				"summary": "Missing score."
			});
		}
		else if(isNaN(score)) {
			res.status(400);
			res.jsonx({
				"error": "E_BADPARAM",
				"status": 400,
				"summary": "Bad score."
			});
		}
		else if(!req.body.notes) {
			res.status(400);
			res.jsonx({
				"error": "E_BADPARAM",
				"status": 400,
				"summary": "Missing notes."
			});
		}
		else {
			Grade.create({
				score: score,
				notes: req.body.notes,
				user: req.user.id
			}, function(err, grade) {
				if(err) {
					res.status(500);
					res.jsonx({
						"error": err,
						"status": 500,
						"summary": "Unknown database error."
					});
				}
				else {
					Submission.update({
						id: submissionId
					}, {
						grade: grade.id
					}, function(err) {
						if(err) {
							res.status(500);
							res.jsonx({
								"error": err,
								"status": 500,
								"summary": "Unknown database error."
							});
						}
						else {
							res.jsonx(grade);
						}
					})
				}
			});
		}
	}
};

