var AWS = require('aws-sdk');
var config = require('../../config/local.js')
AWS.config.update(config.aws);
module.exports = new AWS.S3(config.aws.s3);
// module.exports = {
// 	locales: {},
// 	get: function(key, locale) {

// 		if(!this.locales.hasOwnProperty(locale)) {
// 			var p = path.join(sails.config.i18n.directory, locale)+sails.config.i18n.extension;
// 			try {
// 				this.locales[locale] = require(p);
// 			}
// 			catch(e) {
// 				this.locales[locale] = false;
// 			}
// 		}

// 		if(!this.locales[locale]) {
// 			return key;
// 		}

// 		if(!this.locales[locale].hasOwnProperty(key)) {
// 			return key;
// 		}

// 		return this.locales[locale][key];
// 	}
// };