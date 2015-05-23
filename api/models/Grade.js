/**
* Grade.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		score: {
			type: 'integer',
			required: false
		},
		notes: {
			type: 'text',
			required: true
		},
		user: {
			model: 'User'
		},
		deletedAt: {
			type: 'datetime',
			required: false
		}
	}
};

