'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ObjectId = mongoose.Types;

exports.update = function (req, res, next) {

	User.findOne({ login : req.body.login }, function (err, user) {
		if (err) {
			return res.send(500, err);
		}
		if (!user) {
			return res.send(500, 'Unknown login');
		}
		user.sync = {
			date  : req.body.date,
			logins: req.body.targets
		};
		user.save(function (err, user) {
			if (err) {
				return res.send(500, err);
			}
			else {
				res.json(200, 'ok');
			}
		});
	});
};
