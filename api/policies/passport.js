/**
 * Passport Middleware
 *
 * Policy for Sails that initializes Passport.js and as well as its built-in
 * session support.
 *
 * In a typical web application, the credentials used to authenticate a user
 * will only be transmitted during the login request. If authentication
 * succeeds, a session will be established and maintained via a cookie set in
 * the user's browser.
 *
 * Each subsequent request will not contain credentials, but rather the unique
 * cookie that identifies the session. In order to support login sessions,
 * Passport will serialize and deserialize user instances to and from the
 * session.
 *
 * For more information on the Passport.js middleware, check out:
 * http://passportjs.org/guide/configure/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
var async = require('async');
var GitHubApi = require("github");
var github = new GitHubApi({
	// required
	version: "3.0.0",
	// optional
	debug: false,
	protocol: "https",
	// host: "assignments.nutellahabit.com",
	// pathPrefix: "/api/v3", // for some GHEs
	timeout: 5000,
	headers: {
	    "user-agent": "assignments.nutellahabit.com" // GitHub is happy with a unique user agent
	}
});
module.exports = function (req, res, next) {
	// Initialize Passport
	passport.initialize()(req, res, function () {
		// Use the built-in sessions
		passport.session()(req, res, function () {
			// Make the user available throughout the frontend
			res.locals.user = req.user;

			if(!req.user)
				return next();

			if(req.user.name && req.user.email)
				return next();

			async.auto({
				passport: function(cb) {
					Passport
					.findOne()
					.where({user: req.user.id, provider: 'github'})
					.exec(cb);
				},
				auth: ['passport', function(cb, results) {
					github.authenticate({
						type: "oauth",
						token: results.passport.tokens.accessToken
					});
					cb();
				}],
				user: ['auth', function(cb, results) {
					github.user.get({}, cb);
				}],
				email: ['auth', function(cb, results) {
					github.user.getEmails({}, cb);
				}],
				update: ['user', 'email', function(cb, results) {
					var primaryEmail = _.findWhere(results.email, {primary: true});
					primaryEmail = primaryEmail ? primaryEmail.email : null;
					User.update(
						{ id: req.user.id },
						{
							name: results.user.name || results.user.login,
							email: primaryEmail,
							avatar: results.user.avatar_url
						},
						cb
					);
					// console.log(results);
					// next();
				}]
			}, function(err, results) {
				if(err) {
					console.log(err);
				}
				else if(results.update && results.update.length) {
					req.user = results.update[0];
					res.locals.user = req.user;
				}
				next();
			});
		});
	});
};
