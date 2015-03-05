/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res) {
		res.view({user: req.user});
	}
};

