/**
* Assignment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		name: {
			type: 'string',
			required: true
		},
		url: {
			type: 'string',
			required: true
		},
		dueAt: {
			type: 'datetime',
			required: true
		},
		distSubdir: {
			type: 'string',
			required: false
		},
		submissions: {
			collection: 'Submission',
			via: 'assignment'
		},
		deletedAt: {
			type: 'datetime',
			required: false
		}
	}
};

