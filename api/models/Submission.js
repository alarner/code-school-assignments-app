/**
* Submission.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		url: {
			type: 'string',
			required: true
		},
		notes: {
			type: 'text',
			required: false
		},
		assignment: {
			model: 'Assignment'
		},
		status: {
			type: 'integer',
			required: true,
			defaultsTo: 1
		},
		user: {
			model: 'User'
		},
		grade: {
			model: 'Grade'
		},
		location: {
			type: 'string',
			required: false
		},
		deletedAt: {
			type: 'datetime',
			required: false
		}
	}
};

