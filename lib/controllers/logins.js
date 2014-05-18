'use strict';

var mongoose = require('mongoose'),
	Login = mongoose.model('Login'),
	ObjectId = mongoose.Types;

exports.getAll = function (req, res, next) {
	Login.find({}, function (err, logins) {
		if (err) {
			return res.send(500, err);
		}
		res.json(200, logins);
	});
};