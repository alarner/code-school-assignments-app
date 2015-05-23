/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var scripts = require('../../gulp/scripts');
var styles = require('../../gulp/styles');

module.exports = {
	index: function(req, res) {
		var scriptHtml = _.map(scripts, function(script) {
			return '<script type="text/javascript" src="'+script+'"></script>';
		}).join('');
		var styleHtml = _.map(styles, function(style) {
			return '<link rel="stylesheet" type="text/css" href="'+style+'">';
		}).join('');
		res.view({user: req.user, scripts: scriptHtml, styles: styleHtml});
	}
};

