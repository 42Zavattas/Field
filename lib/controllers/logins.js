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

exports.getOne = function (req, res, next) {
	Login.findOne({ login: req.params.name }, function (err, login) {
		if (err) {
			return res.send(500, err);
		}
		res.json(200, login);
	});
};
