'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
crypto = require('crypto');

/**
* User Schema
*/
var UserSchema = new Schema({
	login     : String,
	dn        : String,
	sync      : {
		date  : Date,
		logins: [String]
	},
	demo      : { type : Boolean, default : true },
	memo      : { type : Number, default : -1 }
});

/**
* Validations
*/

// Validate email is not taken
UserSchema
	.path('login')
	.validate(function (value, respond) {
		var self = this;
		this.constructor.findOne({login: value}, function (err, user) {
			if (err) throw err;
			if (user) {
				if (self.id === user.id) return respond(true);
				return respond(false);
			}
			respond(true);
		});
	}, 'Login existing.');

module.exports = mongoose.model('User', UserSchema);
